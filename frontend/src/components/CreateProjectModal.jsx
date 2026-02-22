import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { generateIdempotencyKey } from "../lib/idempotency.js";
import Button from "./ui/Button.jsx";
import Chip from "./ui/Chip.jsx";
import Input from "./ui/Input.jsx";
import Modal from "./ui/Modal.jsx";
import Textarea from "./ui/Textarea.jsx";

const initialState = {
  title: "",
  category: "",
  tags: [],
  description: "",
  maxCost: "",
  preferences: "",
  constraints: ""
};

const tagOptions = [
  "IA",
  "IoT",
  "Web",
  "Mobile",
  "Dados",
  "Seguranca",
  "Educacao",
  "Saude"
];

function toPayload(form) {
  return {
    title: form.title.trim() || undefined,
    category: form.category.trim() || undefined,
    tags: form.tags,
    description: form.description.trim(),
    maxCost: Number(form.maxCost || 0),
    preferences: form.preferences.trim() || undefined,
    constraints: form.constraints.trim() || undefined
  };
}

function mapGenerateError(error) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message || "";

  if (status === 402) {
    return "Sem creditos suficientes para gerar um projeto.";
  }

  if (status === 502 || message.toLowerCase().includes("gemini")) {
    return "Falha de IA ao gerar documentos. Tente novamente em instantes.";
  }

  return message || "Nao foi possivel gerar o projeto.";
}

function CreateProjectModal({ open, onClose }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const toggleTag = (tag) => {
    setForm((current) => {
      const exists = current.tags.includes(tag);
      return {
        ...current,
        tags: exists
          ? current.tags.filter((item) => item !== tag)
          : [...current.tags, tag]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.description.trim()) {
      setError("Descricao e obrigatoria.");
      return;
    }

    const payload = toPayload(form);
    if (payload.tags.length === 0) {
      setError("Informe ao menos uma tag.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/projects/generate", payload, {
        headers: { "Idempotency-Key": generateIdempotencyKey() }
      });

      setForm(initialState);
      onClose();
      navigate(`/projects/${data.projectId}`);
    } catch (submitError) {
      setError(mapGenerateError(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Criar projeto">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-900">Criar Projeto</h2>
          <p className="text-sm text-zinc-500">
            Preencha os campos para gerar os 3 documentos automaticamente.
          </p>
          <p className="text-xs font-medium text-teal-700">
            Esta acao vai consumir 1 credito.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            id="title"
            label="Titulo (opcional)"
            value={form.title}
            onChange={handleChange("title")}
            placeholder="Ex.: Plataforma de monitoramento"
          />
          <Input
            id="category"
            label="Categoria (opcional)"
            value={form.category}
            onChange={handleChange("category")}
            placeholder="Ex.: Web"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">Tags</p>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3">
            {tagOptions.map((tag) => {
              const selected = form.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-700/20"
                >
                  <Chip tone={selected ? "accent" : "default"}>{tag}</Chip>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-zinc-500">Selecione uma ou mais tags.</p>
        </div>

        <Textarea
          id="description"
          label="Descricao"
          rows={5}
          value={form.description}
          onChange={handleChange("description")}
          placeholder="Descreva claramente o problema e o objetivo do projeto."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            id="maxCost"
            type="number"
            min="0"
            label="Custo maximo"
            value={form.maxCost}
            onChange={handleChange("maxCost")}
            placeholder="0"
          />
          <div className="sm:col-span-2">
            <Input
              id="preferences"
              label="Preferencias (opcional)"
              value={form.preferences}
              onChange={handleChange("preferences")}
              placeholder="Ex.: React + Node, mobile first"
            />
          </div>
        </div>

        <Textarea
          id="constraints"
          label="Restricoes (opcional)"
          rows={3}
          value={form.constraints}
          onChange={handleChange("constraints")}
          placeholder="Ex.: sem hardware, sem custo recorrente"
        />

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Gerando..." : "Gerar Projeto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateProjectModal;
