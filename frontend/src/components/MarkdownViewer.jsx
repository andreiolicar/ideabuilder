import { useState } from "react";
import Button from "./ui/Button.jsx";
import SegmentedTabs from "./ui/SegmentedTabs.jsx";
import Toast from "./ui/Toast.jsx";

const tabs = [
  { key: "GENERAL", label: "Geral" },
  { key: "TECH_SPECS", label: "Especificacoes" },
  { key: "ROADMAP", label: "Roadmap" }
];

function MarkdownViewer({ documents = [] }) {
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [copied, setCopied] = useState(false);
  const resolvedTab = documents.some((doc) => doc.type === activeTab)
    ? activeTab
    : documents[0]?.type || tabs[0].key;
  const activeDocument = documents.find((doc) => doc.type === resolvedTab);

  const copyMarkdown = async () => {
    if (!activeDocument?.contentMd) {
      return;
    }

    await navigator.clipboard.writeText(activeDocument.contentMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs items={tabs} activeKey={resolvedTab} onChange={setActiveTab} />
        <Button variant="secondary" onClick={copyMarkdown}>
          Copiar Markdown
        </Button>
      </div>
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-zinc-700">
          {activeDocument?.contentMd || "Documento indisponivel."}
        </pre>
      </div>
      <Toast message="Copiado" visible={copied} />
    </div>
  );
}

export default MarkdownViewer;
