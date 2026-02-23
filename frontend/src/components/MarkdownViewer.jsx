import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useToast from "../context/useToast.js";
import Button from "./ui/Button.jsx";
import SegmentedTabs from "./ui/SegmentedTabs.jsx";

const tabs = [
  { key: "GENERAL", label: "Geral" },
  { key: "TECH_SPECS", label: "Tech" },
  { key: "ROADMAP", label: "Roadmap" }
];

const normalizeGeneralHeading = (contentMd, projectTitle) => {
  const source = String(contentMd || "");
  if (!source.trim()) {
    return source;
  }

  const lines = source.split("\n");
  const projectHead = String(projectTitle || "").trim().toLowerCase();

  const firstHeadingIndex = lines.findIndex((line) => line.trim().startsWith("#"));
  if (firstHeadingIndex === -1) {
    return source;
  }

  const headingText = lines[firstHeadingIndex].replace(/^#+\s*/, "").trim().toLowerCase();
  const shouldReplace =
    headingText.includes("projeto de tcc") ||
    (projectHead && headingText.includes(projectHead));

  if (!shouldReplace) {
    return source;
  }

  lines[firstHeadingIndex] = "# Documento Geral do Projeto";
  return lines.join("\n");
};

function MarkdownViewer({ documents = [], projectTitle = "" }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const resolvedTab = documents.some((doc) => doc.type === activeTab)
    ? activeTab
    : documents[0]?.type || tabs[0].key;
  const activeDocument = documents.find((doc) => doc.type === resolvedTab);
  const contentToRender =
    resolvedTab === "GENERAL"
      ? normalizeGeneralHeading(activeDocument?.contentMd, projectTitle)
      : activeDocument?.contentMd;

  const copyMarkdown = async () => {
    if (!activeDocument?.contentMd) {
      return;
    }

    await navigator.clipboard.writeText(activeDocument.contentMd);
    addToast({
      title: "Copiado",
      message: "Markdown copiado para a area de transferencia.",
      tone: "success"
    });
  };

  return (
    <div className="stack-md">
      <div className="flex-between" style={{ gap: "var(--space-3)", flexWrap: "wrap" }}>
        <SegmentedTabs items={tabs} activeKey={resolvedTab} onChange={setActiveTab} />
        <Button variant="secondary" onClick={copyMarkdown}>
          Copiar Markdown
        </Button>
      </div>

      <div className="card">
        <div className="markdown-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {contentToRender || "Documento indisponivel."}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MarkdownViewer;
