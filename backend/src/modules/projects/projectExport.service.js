const PDFDocument = require("pdfkit");
const { Project, Document } = require("../../models");
const { httpError } = require("../../utils/httpError");

const PAGE_MARGIN = 35;
const PROJECT_DOC_ORDER = ["GENERAL", "TECH_SPECS", "ROADMAP"];
const TYPE_LABEL = {
  GENERAL: "Geral",
  TECH_SPECS: "Especificacoes Tecnicas",
  ROADMAP: "Roadmap"
};
const TYPE_FILE_SUFFIX = {
  GENERAL: "geral",
  TECH_SPECS: "tech",
  ROADMAP: "roadmap"
};
const BASE_LINE_GAP = 1.2;

const slugify = (value) =>
  String(value || "projeto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "projeto";

const formatTimestamp = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${min}`;
};

const buildPdfBuffer = (renderFn) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: PAGE_MARGIN }
    });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    try {
      renderFn(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });

const getAvailableWidth = (doc) => doc.page.width - PAGE_MARGIN * 2;
const getBottomLimit = (doc) => doc.page.height - PAGE_MARGIN;

const addTrackedPage = (doc) => {
  doc.addPage();
  doc.x = PAGE_MARGIN;
  doc.y = PAGE_MARGIN;
};

const getDefaultTextOptions = (doc) => ({
  width: getAvailableWidth(doc),
  align: "justify",
  lineGap: BASE_LINE_GAP
});

const drawText = (doc, text, options = {}) => {
  const content = String(text ?? "");
  const { x, y, ...rest } = options;
  const resolved = { ...getDefaultTextOptions(doc), ...rest };

  if (x !== undefined || y !== undefined) {
    return doc.text(content, x, y, resolved);
  }

  return doc.text(content, resolved);
};

const ensureSpace = (doc, neededHeight = 24) => {
  if (doc.y + neededHeight <= getBottomLimit(doc)) {
    return false;
  }
  addTrackedPage(doc);
  return true;
};

const renderSectionTitle = (doc, title) => {
  ensureSpace(doc, 40);
  doc.moveDown(0.2);
  doc.x = PAGE_MARGIN;
  doc.font("Helvetica-Bold").fontSize(13).fillColor("#111827");
  drawText(doc, title, { x: PAGE_MARGIN, width: getAvailableWidth(doc), align: "left", indent: 0 });
  doc.moveDown(0.3);
  doc.x = PAGE_MARGIN;
};

const renderProjectCover = (doc, project, index, total) => {
  if (!(index === 0 && doc.y <= PAGE_MARGIN + 2)) {
    addTrackedPage(doc);
  }
  doc.x = PAGE_MARGIN;

  const tags = Array.isArray(project.tags) ? project.tags : [];
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#111827");
  drawText(doc, project.title || "Projeto", { x: PAGE_MARGIN, width: getAvailableWidth(doc), align: "left", indent: 0 });
  doc.moveDown(0.4);

  doc.font("Helvetica").fontSize(9).fillColor("#374151");
  drawText(doc, `Categoria: ${project.category || "Sem categoria"}`, { x: PAGE_MARGIN, width: getAvailableWidth(doc), align: "left", indent: 0 });
  drawText(doc, `Status: ${project.status}`, { x: PAGE_MARGIN, width: getAvailableWidth(doc), align: "left", indent: 0 });
  drawText(doc, `Tags: ${tags.length ? tags.join(", ") : "Sem tags"}`, { x: PAGE_MARGIN, width: getAvailableWidth(doc), align: "left", indent: 0 });
  drawText(doc, `Gerado em: ${new Date(project.createdAt).toLocaleString("pt-BR")}`, { x: PAGE_MARGIN, width: getAvailableWidth(doc), align: "left", indent: 0 });
  drawText(doc, `Projeto ${index + 1} de ${total}`, { x: PAGE_MARGIN, width: getAvailableWidth(doc), align: "left", indent: 0 });
  doc.moveDown(1.2);
  doc.x = PAGE_MARGIN;
};

const splitTableRow = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const parseMarkdown = (content) => {
  const lines = String(content || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let codeLines = [];
  let inCode = false;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };

  const flushCode = () => {
    if (codeLines.length) {
      blocks.push({ type: "code", text: codeLines.join("\n") });
      codeLines = [];
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        flushCode();
      } else {
        flushParagraph();
      }
      inCode = !inCode;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim()
      });
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      blocks.push({ type: "list-item", ordered: true, text: orderedMatch[1] });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      blocks.push({ type: "list-item", ordered: false, text: unorderedMatch[1] });
      continue;
    }

    if (trimmed.includes("|") && i + 1 < lines.length && /^(\s*\|)?\s*:?-{3,}/.test(lines[i + 1].trim())) {
      flushParagraph();
      const header = splitTableRow(trimmed);
      i += 1; // skip separator row
      const rows = [];

      while (i + 1 < lines.length) {
        const candidate = lines[i + 1];
        if (!candidate.trim() || !candidate.includes("|")) {
          break;
        }
        i += 1;
        rows.push(splitTableRow(candidate));
      }

      blocks.push({ type: "table", header, rows });
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushCode();
  return blocks;
};

const renderTable = (doc, table) => {
  const maxWidth = getAvailableWidth(doc);
  const colCount = Math.max(table.header.length, ...table.rows.map((row) => row.length), 1);
  const colWidth = maxWidth / colCount;
  const xStart = PAGE_MARGIN;
  doc.x = PAGE_MARGIN;

  const calculateRowHeight = (cells, isHeader = false) => {
    const preparedCells = Array.from({ length: colCount }).map((_, index) => cells[index] || "");
    const heights = preparedCells.map(
      (cell) =>
        doc.heightOfString(cell, {
          width: colWidth - 6,
          align: "left",
          lineGap: 1
        }) + 6
    );
    return Math.max(...heights, isHeader ? 18 : 16);
  };

  const drawRow = (cells, isHeader = false) => {
    const preparedCells = Array.from({ length: colCount }).map((_, index) => cells[index] || "");
    const rowHeight = calculateRowHeight(preparedCells, isHeader);
    const y = doc.y;

    if (isHeader) {
      doc.save();
      doc.rect(xStart, y, maxWidth, rowHeight).fill("#f3f4f6");
      doc.restore();
    }

    preparedCells.forEach((cell, index) => {
      const x = xStart + index * colWidth;
      doc.rect(x, y, colWidth, rowHeight).stroke("#d1d5db");
      doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(8.5).fillColor("#111827");
      drawText(doc, cell, {
        x: x + 3,
        y: y + 3,
        width: colWidth - 6,
        align: "left",
        lineGap: 1,
        indent: 0,
        paragraphGap: 0
      });
    });

    doc.y = y + rowHeight + 2;
    return rowHeight;
  };

  const drawHeaderWithSpaceControl = () => {
    const headerHeight = calculateRowHeight(table.header, true);
    ensureSpace(doc, headerHeight + 2);
    drawRow(table.header, true);
  };

  drawHeaderWithSpaceControl();
  table.rows.forEach((row) => {
    const rowHeight = calculateRowHeight(row, false);
    if (doc.y + rowHeight > getBottomLimit(doc)) {
      addTrackedPage(doc);
      drawHeaderWithSpaceControl();
    }
    drawRow(row, false);
  });
  doc.moveDown(0.4);
  doc.x = PAGE_MARGIN;
};

const CONTENT_CLEANUP_REGEX = /^\s*_?Valores estimados para planejamento academico; validar com fornecedores\._?\s*$/gim;

const sanitizeMarkdownForPdf = (content) =>
  String(content || "")
    .replace(CONTENT_CLEANUP_REGEX, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const renderMarkdown = (doc, content) => {
  const blocks = parseMarkdown(sanitizeMarkdownForPdf(content));
  const textWidth = getAvailableWidth(doc);

  blocks.forEach((block) => {
    if (block.type === "heading") {
      const headingSize = block.level === 1 ? 16 : block.level === 2 ? 13 : 11;
      const headingHeight = doc.heightOfString(block.text, {
        width: textWidth,
        align: "left",
        lineGap: BASE_LINE_GAP
      });
      ensureSpace(doc, headingHeight + 16);
      doc.moveDown(0.2);
      doc.x = PAGE_MARGIN;
      doc.font("Helvetica-Bold").fontSize(headingSize).fillColor("#111827");
      drawText(doc, block.text, { x: PAGE_MARGIN, width: textWidth, align: "left", indent: 0 });
      doc.moveDown(0.2);
      doc.x = PAGE_MARGIN;
      return;
    }

    if (block.type === "paragraph") {
      const paragraphHeight = doc.heightOfString(block.text, {
        width: textWidth,
        align: "justify",
        lineGap: BASE_LINE_GAP
      });
      ensureSpace(doc, paragraphHeight + 10);
      doc.x = PAGE_MARGIN;
      doc.font("Helvetica").fontSize(9).fillColor("#1f2937");
      drawText(doc, block.text, { x: PAGE_MARGIN, width: textWidth, align: "justify", indent: 0 });
      doc.moveDown(0.25);
      doc.x = PAGE_MARGIN;
      return;
    }

    if (block.type === "list-item") {
      const listIndent = 10;
      const bullet = block.ordered ? "1." : "\u2022";
      const listText = `${bullet} ${block.text}`;
      const listHeight = doc.heightOfString(listText, {
        width: textWidth - listIndent,
        align: "left",
        lineGap: BASE_LINE_GAP
      });
      ensureSpace(doc, listHeight + 8);
      doc.font("Helvetica").fontSize(9).fillColor("#1f2937");
      drawText(doc, listText, {
        x: PAGE_MARGIN + listIndent,
        width: textWidth - listIndent,
        align: "left",
        indent: 0
      });
      doc.moveDown(0.1);
      doc.x = PAGE_MARGIN;
      return;
    }

    if (block.type === "code") {
      const codeHeight =
        doc.heightOfString(block.text || "", {
          width: textWidth - 20,
          align: "left",
          lineGap: 1
        }) + 16;
      ensureSpace(doc, codeHeight + 8);
      const y = doc.y;
      doc.save();
      doc.rect(PAGE_MARGIN, y, textWidth, codeHeight).fill("#f9fafb").stroke("#e5e7eb");
      doc.restore();
      doc.font("Courier").fontSize(8).fillColor("#111827");
      drawText(doc, block.text || "", {
        x: PAGE_MARGIN + 10,
        y: y + 8,
        width: textWidth - 20,
        align: "left",
        lineGap: 2,
        indent: 0
      });
      doc.y = y + codeHeight + 6;
      doc.x = PAGE_MARGIN;
      return;
    }

    if (block.type === "table") {
      renderTable(doc, block);
      doc.x = PAGE_MARGIN;
    }
  });
};

const getDocumentByType = (project, type) => {
  const document = (project.documents || []).find((item) => item.type === type);
  if (!document?.contentMd) {
    throw httpError(422, `Documento ${type} indisponivel para exportacao`);
  }
  return document;
};

const validateProjectForExport = (project) => {
  if (project.status !== "READY") {
    throw httpError(422, "Projeto ainda nao esta pronto para exportacao");
  }
  if (!Array.isArray(project.documents) || project.documents.length === 0) {
    throw httpError(422, "Projeto sem documentos para exportacao");
  }
};

const fetchOwnedProject = async (userId, projectId) => {
  const project = await Project.findOne({
    where: { id: projectId, userId },
    include: [{ model: Document, as: "documents" }]
  });

  if (!project) {
    throw httpError(404, "Project not found");
  }
  validateProjectForExport(project);
  return project;
};

const fetchOwnedProjectsBatch = async (userId, projectIds) => {
  const uniqueIds = [...new Set(projectIds)];
  if (uniqueIds.length > 50) {
    throw httpError(413, "Limite de exportacao excedido (maximo de 50 projetos)");
  }

  const projects = await Project.findAll({
    where: { id: uniqueIds, userId },
    include: [{ model: Document, as: "documents" }]
  });

  if (projects.length !== uniqueIds.length) {
    throw httpError(404, "Um ou mais projetos nao foram encontrados");
  }

  const byId = new Map(projects.map((project) => [project.id, project]));
  const ordered = uniqueIds.map((id) => byId.get(id));

  ordered.forEach(validateProjectForExport);
  return ordered;
};

const renderSingleProjectScope = (doc, project, scope, type) => {
  renderProjectCover(doc, project, 0, 1);
  addTrackedPage(doc);

  if (scope === "document") {
    const selectedDocument = getDocumentByType(project, type);
    renderSectionTitle(doc, TYPE_LABEL[type] || type);
    renderMarkdown(doc, selectedDocument.contentMd);
    return;
  }

  PROJECT_DOC_ORDER.forEach((documentType, index) => {
    if (index > 0) {
      addTrackedPage(doc);
    }
    const selectedDocument = getDocumentByType(project, documentType);
    renderSectionTitle(doc, TYPE_LABEL[documentType]);
    renderMarkdown(doc, selectedDocument.contentMd);
  });
};

const renderBatchScope = (doc, projects) => {
  projects.forEach((project, index) => {
    renderProjectCover(doc, project, index, projects.length);

    PROJECT_DOC_ORDER.forEach((documentType) => {
      addTrackedPage(doc);
      const selectedDocument = getDocumentByType(project, documentType);
      renderSectionTitle(doc, TYPE_LABEL[documentType]);
      renderMarkdown(doc, selectedDocument.contentMd);
    });
  });
};

const exportProjectPdf = async ({ userId, projectId, scope, type }) => {
  const project = await fetchOwnedProject(userId, projectId);
  if (scope === "document" && !type) {
    throw httpError(400, "type is required when scope=document");
  }

  const buffer = await buildPdfBuffer((doc) => {
    renderSingleProjectScope(doc, project, scope, type);
  });

  const projectSlug = slugify(project.title);
  const filename =
    scope === "document"
      ? `projeto-${projectSlug}-${TYPE_FILE_SUFFIX[type] || "documento"}.pdf`
      : `projeto-${projectSlug}-completo.pdf`;

  return { buffer, filename };
};

const exportProjectsBatchPdf = async ({ userId, projectIds }) => {
  const projects = await fetchOwnedProjectsBatch(userId, projectIds);

  const buffer = await buildPdfBuffer((doc) => {
    renderBatchScope(doc, projects);
  });
  const filename = `projetos-selecionados-${formatTimestamp()}.pdf`;
  return { buffer, filename };
};

module.exports = {
  exportProjectPdf,
  exportProjectsBatchPdf
};
