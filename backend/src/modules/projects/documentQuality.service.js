const DOC_HEADINGS = {
  GENERAL: "# Documento Geral do Projeto",
  TECH_SPECS: "# Especificacoes Tecnicas",
  ROADMAP: "# Roadmap de Desenvolvimento (2 anos)"
};

const COST_FOOTER =
  "_Valores estimados para planejamento academico; validar com fornecedores._";

const cleanText = (value) => String(value || "").trim();

const hasCostSection = (content) => /#{1,3}\s+.*custo/i.test(String(content || ""));

const hasMarkdownTable = (content) => {
  const lines = String(content || "").split("\n");
  return lines.some((line) => /\|/.test(line)) && lines.some((line) => /^(\s*\|)?\s*:?-{3,}/.test(line));
};

const normalizeHeading = (content, documentType) => {
  const source = cleanText(content);
  if (!source) {
    return `${DOC_HEADINGS[documentType]}\n`;
  }

  const lines = source.split("\n");
  const firstHeadingIndex = lines.findIndex((line) => line.trim().startsWith("#"));

  if (firstHeadingIndex === -1) {
    return `${DOC_HEADINGS[documentType]}\n\n${source}`;
  }

  lines[firstHeadingIndex] = DOC_HEADINGS[documentType];
  return lines.join("\n");
};

const isIotProject = (payload) =>
  (Array.isArray(payload?.tags) ? payload.tags : []).some(
    (tag) => String(tag).trim().toLowerCase() === "iot"
  );

const parseMaxCost = (value) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return 0;
};

const formatCurrency = (value) => {
  const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
  return safe.toFixed(2);
};

const buildDefaultCostRows = (payload, documentType) => {
  const maxCost = parseMaxCost(payload?.maxCost);
  const hasIot = isIotProject(payload);
  const base = [
    { item: "Pesquisa e validacao do problema", weight: 0.2 },
    { item: "Implementacao e desenvolvimento", weight: 0.45 },
    { item: "Documentacao e apresentacao", weight: 0.15 },
    { item: "Testes e ajustes finais", weight: 0.2 }
  ];

  if (documentType === "ROADMAP") {
    base.splice(0, base.length, 
      { item: "Fase 1 - Descoberta e planejamento", weight: 0.2 },
      { item: "Fase 2 - Prototipo e validacao", weight: 0.3 },
      { item: "Fase 3 - Implementacao", weight: 0.35 },
      { item: "Fase 4 - Consolidacao e entrega", weight: 0.15 }
    );
  }

  if (hasIot && documentType !== "ROADMAP") {
    base.push({ item: "Componentes IoT e integracao", weight: 0.25 });
  }

  const totalWeight = base.reduce((acc, row) => acc + row.weight, 0);
  return base.map((row) => {
    const value = maxCost > 0 ? (maxCost * row.weight) / totalWeight : 0;
    return {
      item: row.item,
      cost: value
    };
  });
};

const buildCostTable = (rows) => {
  const body = rows
    .map((row) => `| ${row.item} | ${formatCurrency(row.cost)} |`)
    .join("\n");

  const total = rows.reduce((acc, row) => acc + Number(row.cost || 0), 0);

  return [
    "| Item | Custo estimado (R$) |",
    "| --- | ---: |",
    body,
    `| **Total estimado** | **${formatCurrency(total)}** |`
  ].join("\n");
};

const ensureCostContent = (content, payload, documentType) => {
  const normalized = normalizeHeading(content, documentType);
  const alreadyHasCosts = hasCostSection(normalized) && hasMarkdownTable(normalized);

  if (alreadyHasCosts) {
    if (normalized.includes(COST_FOOTER)) {
      return normalized;
    }
    return `${normalized}\n\n${COST_FOOTER}`;
  }

  const rows = buildDefaultCostRows(payload, documentType);
  const sectionTitle =
    documentType === "ROADMAP"
      ? "## Estimativa de custos por fase"
      : "## Custos estimados";

  return [
    normalized,
    "",
    sectionTitle,
    "",
    buildCostTable(rows),
    "",
    COST_FOOTER
  ].join("\n");
};

const hasIotBomTable = (content) =>
  /bom iot|componentes iot|sensores/i.test(String(content || "")) &&
  hasMarkdownTable(content);

const buildIotBomSection = (payload) => {
  const maxCost = parseMaxCost(payload?.maxCost);
  const rows = [
    { item: "Microcontrolador (ESP32 ou similar)", qty: 1, unit: maxCost > 0 ? maxCost * 0.25 : 120 },
    { item: "Sensor principal", qty: 2, unit: maxCost > 0 ? maxCost * 0.12 : 60 },
    { item: "Modulo de comunicacao", qty: 1, unit: maxCost > 0 ? maxCost * 0.18 : 90 },
    { item: "Fonte e cabos", qty: 1, unit: maxCost > 0 ? maxCost * 0.08 : 40 }
  ];

  const lines = rows.map((row) => {
    const total = Number(row.qty) * Number(row.unit);
    return `| ${row.item} | ${row.qty} | ${formatCurrency(row.unit)} | ${formatCurrency(total)} |`;
  });

  return [
    "## BOM IoT (componentes e custos)",
    "",
    "| Componente | Qtde | Custo unitario (R$) | Custo total (R$) |",
    "| --- | ---: | ---: | ---: |",
    ...lines
  ].join("\n");
};

const ensureIotSection = (content, payload) => {
  if (!isIotProject(payload)) {
    return content;
  }

  if (hasIotBomTable(content)) {
    return content;
  }

  return `${content}\n\n${buildIotBomSection(payload)}`;
};

const enrichGeneratedDocuments = (payload, generated) => {
  const safeGenerated = {
    general_md: cleanText(generated?.general_md),
    tech_specs_md: cleanText(generated?.tech_specs_md),
    roadmap_md: cleanText(generated?.roadmap_md),
    suggested_title: cleanText(generated?.suggested_title)
  };

  const general = ensureCostContent(safeGenerated.general_md, payload, "GENERAL");
  const techBase = ensureCostContent(safeGenerated.tech_specs_md, payload, "TECH_SPECS");
  const tech = ensureIotSection(techBase, payload);
  const roadmap = ensureCostContent(safeGenerated.roadmap_md, payload, "ROADMAP");

  return {
    ...safeGenerated,
    general_md: general,
    tech_specs_md: tech,
    roadmap_md: roadmap
  };
};

module.exports = {
  enrichGeneratedDocuments
};
