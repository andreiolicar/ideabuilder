import { useState } from "react";
import ReactMarkdown from "react-markdown";
import useToast from "../context/useToast.js";
import Button from "./ui/Button.jsx";
import SegmentedTabs from "./ui/SegmentedTabs.jsx";

const tabs = [
  { key: "GENERAL", label: "Geral" },
  { key: "TECH_SPECS", label: "Tech" },
  { key: "ROADMAP", label: "Roadmap" }
];

function MarkdownViewer({ documents = [] }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const resolvedTab = documents.some((doc) => doc.type === activeTab)
    ? activeTab
    : documents[0]?.type || tabs[0].key;
  const activeDocument = documents.find((doc) => doc.type === resolvedTab);

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
          <ReactMarkdown>
            {activeDocument?.contentMd || "Documento indisponivel."}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default MarkdownViewer;
