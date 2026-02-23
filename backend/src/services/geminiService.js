require("../config/env");
const { httpError } = require("../utils/httpError");

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const FALLBACK_MODELS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash"];
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 35000);
const JSON_START_DELIMITER = "<<JSON_START>>";
const JSON_END_DELIMITER = "<<JSON_END>>";

const buildPrompt = (projectPayload) => {
  const safePayload = {
    title: projectPayload?.title || "",
    category: projectPayload?.category || "",
    tags: Array.isArray(projectPayload?.tags) ? projectPayload.tags : [],
    description: projectPayload?.description || "",
    maxCost: projectPayload?.maxCost ?? null,
    preferences: projectPayload?.preferences || "",
    constraints: projectPayload?.constraints || ""
  };

  return [
    "Voce e um assistente especializado em TCC.",
    "Gere 3 documentos em Markdown para o projeto informado, com estrutura profissional.",
    "Retorne SOMENTE um JSON valido com as chaves:",
    "general_md, tech_specs_md, roadmap_md, suggested_title.",
    `Envolva o JSON com os delimitadores ${JSON_START_DELIMITER} e ${JSON_END_DELIMITER}.`,
    "Nao retorne explicacoes extras.",
    "",
    "Requisitos obrigatorios de estrutura:",
    "1) general_md deve conter: titulo do documento, resumo executivo, problema/contexto, objetivos, publico-alvo, escopo (in/out), custos estimados em tabela markdown e riscos iniciais.",
    "2) tech_specs_md deve conter: requisitos funcionais/nao funcionais, arquitetura, stack e justificativa, modelo de dados de alto nivel, criterios de aceitacao, custos tecnicos em tabela markdown.",
    "3) Se o projeto tiver tag IoT, inclua em tech_specs_md uma tabela BOM IoT com colunas: Componente | Qtde | Custo unitario | Custo total.",
    "4) roadmap_md deve conter fases por periodo, entregaveis, dependencias, indicadores de progresso e estimativa de custos por fase em tabela markdown.",
    "5) Sempre informe custos em reais (R$), com valores estimados e total.",
    "6) Nao repetir o titulo do projeto em todos os documentos; cada documento deve ter cabecalho apropriado ao tipo.",
    "",
    "Payload do projeto:",
    JSON.stringify(safePayload, null, 2)
  ].join("\n");
};

const extractTextFromGeminiResponse = (apiResponse) => {
  const parts = apiResponse?.candidates?.[0]?.content?.parts;

  if (!Array.isArray(parts) || parts.length === 0) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
};

const findFirstJsonObject = (text) => {
  const start = text.indexOf("{");
  if (start === -1) {
    return null;
  }

  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
};

const parseModelOutput = (rawText) => {
  if (!rawText) {
    throw new Error("Gemini returned empty content");
  }

  try {
    return JSON.parse(rawText);
  } catch (_error) {
    console.warn("[geminiService] direct JSON parse failed; trying fallback parsers");
  }

  const delimitedMatch = rawText.match(
    new RegExp(`${JSON_START_DELIMITER}([\\s\\S]*?)${JSON_END_DELIMITER}`)
  );
  if (delimitedMatch?.[1]) {
    try {
      return JSON.parse(delimitedMatch[1].trim());
    } catch (_error) {
      console.warn("[geminiService] delimiter JSON parse failed");
    }
  }

  const fencedMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1].trim());
    } catch (_error) {
      console.warn("[geminiService] fenced JSON parse failed");
    }
  }

  const objectCandidate = findFirstJsonObject(rawText);
  if (objectCandidate) {
    try {
      return JSON.parse(objectCandidate);
    } catch (_error) {
      console.warn("[geminiService] object candidate JSON parse failed");
    }
  }

  const tolerant = parseTolerantKeySections(rawText);
  if (tolerant) {
    console.warn("[geminiService] tolerant key-section parser used");
    return tolerant;
  }

  throw new Error("Could not parse Gemini response as JSON");
};

const decodeLooseValue = (value) =>
  String(value || "")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\r/g, "");

const parseTolerantKeySections = (text) => {
  const source = String(text || "");
  if (!source) {
    return null;
  }

  const section =
    source.match(
      new RegExp(`${JSON_START_DELIMITER}([\\s\\S]*?)${JSON_END_DELIMITER}`)
    )?.[1] || source;

  const general = section.match(
    /"general_md"\s*:\s*"([\s\S]*?)"\s*,\s*"tech_specs_md"/
  )?.[1];
  const tech = section.match(
    /"tech_specs_md"\s*:\s*"([\s\S]*?)"\s*,\s*"roadmap_md"/
  )?.[1];
  const roadmap = section.match(
    /"roadmap_md"\s*:\s*"([\s\S]*?)"\s*,\s*"suggested_title"/
  )?.[1];
  const suggested = section.match(
    /"suggested_title"\s*:\s*"([\s\S]*?)"\s*}/
  )?.[1];

  if (!general || !tech || !roadmap) {
    return null;
  }

  return {
    general_md: decodeLooseValue(general).trim(),
    tech_specs_md: decodeLooseValue(tech).trim(),
    roadmap_md: decodeLooseValue(roadmap).trim(),
    suggested_title: decodeLooseValue(suggested || "").trim()
  };
};

const normalizeResult = (parsed) => ({
  general_md: typeof parsed?.general_md === "string" ? parsed.general_md : "",
  tech_specs_md:
    typeof parsed?.tech_specs_md === "string" ? parsed.tech_specs_md : "",
  roadmap_md: typeof parsed?.roadmap_md === "string" ? parsed.roadmap_md : "",
  suggested_title:
    typeof parsed?.suggested_title === "string" ? parsed.suggested_title : ""
});

const normalizeModelName = (name) => String(name || "").replace(/^models\//, "");

const buildModelCandidates = () => {
  const configured = normalizeModelName(DEFAULT_MODEL);
  const candidates = [configured, ...FALLBACK_MODELS.map(normalizeModelName)];
  return [...new Set(candidates)];
};

const callGemini = async ({ model, apiKey, prompt }) => {
  const url = `${GEMINI_API_BASE_URL}/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      }),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const generateProjectDocs = async (projectPayload) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw httpError(500, "GEMINI_API_KEY is not configured");
  }

  const prompt = buildPrompt(projectPayload);
  const modelCandidates = buildModelCandidates();

  console.info("[geminiService] starting generation");

  let lastError = null;
  for (const model of modelCandidates) {
    let response = null;
    let responseBody = "";

    try {
      console.info(`[geminiService] trying model: ${model}`);
      response = await callGemini({ model, apiKey, prompt });
      responseBody = await response.text();
    } catch (error) {
      const isTimeout = error?.name === "AbortError";
      console.error(
        "[geminiService] request failed:",
        isTimeout ? `timeout (${REQUEST_TIMEOUT_MS}ms)` : error.message
      );
      lastError = httpError(
        502,
        isTimeout
          ? "Gemini request timed out"
          : "Failed to reach Gemini API"
      );
      continue;
    }

    if (!response.ok) {
      const isModelNotFound =
        response.status === 404 &&
        responseBody.toLowerCase().includes("not found");

      if (isModelNotFound) {
        console.warn(`[geminiService] model not available: ${model}. Trying fallback...`);
        continue;
      }

      console.error("[geminiService] Gemini API error:", response.status, responseBody);
      lastError = httpError(502, "Gemini API returned an error");
      continue;
    }

    console.info(`[geminiService] model accepted: ${model}`);
    let apiResponse;
    try {
      apiResponse = JSON.parse(responseBody);
    } catch (error) {
      console.error("[geminiService] invalid JSON response from Gemini");
      lastError = httpError(502, "Gemini API returned invalid JSON");
      continue;
    }

    const rawText = extractTextFromGeminiResponse(apiResponse);

    let parsed;
    try {
      parsed = parseModelOutput(rawText);
    } catch (error) {
      console.error("[geminiService] parse failed for model", model, error.message);
      lastError = httpError(502, "Failed to parse Gemini response");
      continue;
    }

    const normalized = normalizeResult(parsed);
    console.info("[geminiService] generation completed");
    return normalized;
  }

  console.error("[geminiService] no usable result from candidate models:", modelCandidates.join(", "));
  throw lastError || httpError(502, "No compatible Gemini model available for generateContent");
};

module.exports = {
  buildPrompt,
  generateProjectDocs
};
