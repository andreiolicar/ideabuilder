import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useToast from "../context/useToast.js";
import api from "../lib/api.js";
import { generateIdempotencyKey } from "../lib/idempotency.js";
import Button from "./ui/Button.jsx";
import Chip from "./ui/Chip.jsx";
import Input from "./ui/Input.jsx";
import Modal from "./ui/Modal.jsx";
import Spinner from "./ui/Spinner.jsx";
import Textarea from "./ui/Textarea.jsx";

const initialState = {
  category: "",
  tags: [],
  areas: [],
  description: "",
  maxCost: "",
  targetAudience: "",
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
  "Cloud"
];

const areaOptions = [
  "Educacao",
  "Saude",
  "Sustentabilidade",
  "Mobilidade urbana",
  "Acessibilidade",
  "Seguranca publica"
];

function toPayload(form) {
  const mergedTags = Array.from(new Set([...form.tags, ...form.areas]));
  const preferencesParts = [];
  if (form.preferences.trim()) {
    preferencesParts.push(form.preferences.trim());
  }
  if (form.targetAudience.trim()) {
    preferencesParts.push(`Publico-alvo: ${form.targetAudience.trim()}`);
  }

  return {
    category: form.category.trim() || undefined,
    tags: mergedTags,
    description: form.description.trim(),
    maxCost: Number(form.maxCost || 0),
    preferences: preferencesParts.join("\n") || undefined,
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
  const { addToast } = useToast();
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

  const toggleArea = (area) => {
    setForm((current) => {
      const exists = current.areas.includes(area);
      return {
        ...current,
        areas: exists
          ? current.areas.filter((item) => item !== area)
          : [...current.areas, area]
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.description.trim()) {
      const message = "Descricao e obrigatoria.";
      setError(message);
      addToast({ title: "Validacao", message, tone: "warning" });
      return;
    }

    const payload = toPayload(form);
    if (payload.tags.length === 0) {
      const message = "Informe ao menos uma tag.";
      setError(message);
      addToast({ title: "Validacao", message, tone: "warning" });
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/projects/generate", payload, {
        headers: { "Idempotency-Key": generateIdempotencyKey() }
      });

      setForm(initialState);
      onClose();
      addToast({
        title: "Projeto criado",
        message: "Documentacoes geradas com sucesso.",
        tone: "success"
      });
      navigate(`/projects/${data.projectId}`);
    } catch (submitError) {
      const message = mapGenerateError(submitError);
      setError(message);
      addToast({ title: "Erro", message, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        open={open && !loading}
        onClose={onClose}
        title="Criar projeto"
        className="modal--project"
      >
        <form className="stack-md" onSubmit={handleSubmit}>
          <div className="stack-sm">
            <h2 className="heading-sm">Criar projeto</h2>
            <p className="body-sm">Preencha os campos para gerar os 3 documentos automaticamente.</p>
            <Chip tone="warning">Esta acao vai consumir 1 credito.</Chip>
          </div>

          <div className="project-form-grid">
            <Input
              id="category"
              label="Categoria (opcional)"
              value={form.category}
              onChange={handleChange("category")}
              placeholder="Ex.: Web"
            />

            <Input
              id="preferences"
              label="Preferencias (opcional)"
              value={form.preferences}
              onChange={handleChange("preferences")}
              placeholder="Ex.: React + Node, mobile first"
            />

            <div className="stack-sm">
              <p className="label" style={{ marginBottom: 0 }}>
                Tags
              </p>
              <div className="project-tags-box">
                {tagOptions.map((tag) => {
                  const selected = form.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                    >
                      <Chip tone={selected ? "accent" : "default"}>{tag}</Chip>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="stack-sm">
              <p className="label" style={{ marginBottom: 0 }}>
                Areas de atuacao
              </p>
              <div className="project-tags-box">
                {areaOptions.map((area) => {
                  const selected = form.areas.includes(area);
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                    >
                      <Chip tone={selected ? "info" : "default"}>{area}</Chip>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="project-description-field">
              <Textarea
                id="description"
                label="Descricao"
                rows={4}
                className="project-description-input"
                value={form.description}
                onChange={handleChange("description")}
                placeholder="Descreva claramente o problema e o objetivo do projeto."
              />
            </div>

            <div className="project-right-stack">
              <Input
                id="maxCost"
                type="number"
                min="0"
                label="Custo maximo"
                value={form.maxCost}
                onChange={handleChange("maxCost")}
                placeholder="0"
              />

              <Input
                id="targetAudience"
                label="Publico-alvo (opcional)"
                value={form.targetAudience}
                onChange={handleChange("targetAudience")}
                placeholder="Ex.: pessoas com deficiencia visual"
              />
            </div>

            <div className="project-form-span-2">
              <Textarea
                id="constraints"
                label="Restricoes (opcional)"
                rows={2}
                value={form.constraints}
                onChange={handleChange("constraints")}
                placeholder="Ex.: sem hardware, sem custo recorrente"
              />
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Gerar projeto
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={loading}
        title="Gerando documentacoes"
        closeOnBackdrop={false}
        closeOnEscape={false}
        className="modal--loading"
      >
        <div className="loading-modal-content">
          <Spinner className="loading-spinner" />
          <h3 className="heading-sm" style={{ margin: 0 }}>
            Gerando documentacoes com IA
          </h3>
          <p className="body-sm" style={{ margin: 0 }}>
            Isso pode levar alguns segundos. Estamos estruturando os 3 documentos do projeto.
          </p>
        </div>
      </Modal>
    </>
  );
}

export default CreateProjectModal;
