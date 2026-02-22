require("../config/env");
const { httpError } = require("../utils/httpError");

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
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
    "Gere 3 documentos em Markdown para o projeto informado.",
    "Retorne SOMENTE um JSON valido com as chaves:",
    "general_md, tech_specs_md, roadmap_md, suggested_title.",
    `Envolva o JSON com os delimitadores ${JSON_START_DELIMITER} e ${JSON_END_DELIMITER}.`,
    "Nao retorne explicacoes extras.",
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
    return JSON.parse(objectCandidate);
  }

  throw new Error("Could not parse Gemini response as JSON");
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

  return fetch(url, {
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
    })
  });
};

const generateProjectDocs = async (projectPayload) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw httpError(500, "GEMINI_API_KEY is not configured");
  }

  const prompt = buildPrompt(projectPayload);
  const modelCandidates = buildModelCandidates();

  console.info("[geminiService] starting generation");

  let response = null;
  let responseBody = "";
  for (const model of modelCandidates) {
    try {
      console.info(`[geminiService] trying model: ${model}`);
      response = await callGemini({ model, apiKey, prompt });
      responseBody = await response.text();
    } catch (error) {
      console.error("[geminiService] request failed:", error.message);
      throw httpError(502, "Failed to reach Gemini API");
    }

    if (response.ok) {
      console.info(`[geminiService] model accepted: ${model}`);
      break;
    }

    const isModelNotFound =
      response.status === 404 &&
      responseBody.toLowerCase().includes("not found");

    if (!isModelNotFound) {
      console.error("[geminiService] Gemini API error:", response.status, responseBody);
      throw httpError(502, "Gemini API returned an error");
    }

    console.warn(`[geminiService] model not available: ${model}. Trying fallback...`);
  }

  if (!response || !response.ok) {
    console.error("[geminiService] no valid model available:", modelCandidates.join(", "));
    throw httpError(502, "No compatible Gemini model available for generateContent");
  }

  const apiResponse = JSON.parse(responseBody);
  const rawText = extractTextFromGeminiResponse(apiResponse);

  let parsed;
  try {
    parsed = parseModelOutput(rawText);
  } catch (error) {
    console.error("[geminiService] parse failed:", error.message);
    throw httpError(502, "Failed to parse Gemini response");
  }

  const normalized = normalizeResult(parsed);
  console.info("[geminiService] generation completed");

  return normalized;
};

module.exports = {
  buildPrompt,
  generateProjectDocs
};
