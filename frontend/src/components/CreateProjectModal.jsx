import { useState } from "react";
import Button from "./ui/Button.jsx";
import Input from "./ui/Input.jsx";
import Modal from "./ui/Modal.jsx";
import Textarea from "./ui/Textarea.jsx";

const initialState = {
  title: "",
  category: "",
  tags: "",
  description: "",
  maxCost: "",
  preferences: "",
  constraints: ""
};

function toPayload(form) {
  return {
    title: form.title.trim() || undefined,
    category: form.category.trim() || undefined,
    tags: form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    description: form.description.trim(),
    maxCost: Number(form.maxCost || 0),
    preferences: form.preferences.trim() || undefined,
    constraints: form.constraints.trim() || undefined
  };
}

function CreateProjectModal({ open, onClose, onCreate, loading }) {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");

  const handleChange = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
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
      await onCreate(payload);
      setForm(initialState);
      onClose();
    } catch (submitError) {
      setError(submitError?.response?.data?.message || "Nao foi possivel gerar o projeto.");
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

        <Input
          id="tags"
          label="Tags"
          helperText="Separe por virgulas. Ex.: IA, Dados, Educacao"
          value={form.tags}
          onChange={handleChange("tags")}
          placeholder="IA, Web, Dados"
        />

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
          <Button type="button" variant="ghost" onClick={onClose}>
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
