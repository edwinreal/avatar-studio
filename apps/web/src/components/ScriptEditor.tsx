import { useEffect, useMemo, useRef, useState } from "react";
import { api, type ScriptAnalysis, type ScriptRecord } from "../lib/api";

type ScriptEditorProps = {
  initialValue?: string;
};

type DetectedTag = {
  label: "vocab" | "grammar";
  value: string;
};

const detectTags = (content: string): DetectedTag[] =>
  Array.from(content.matchAll(/<(vocab|grammar)>(.*?)<\/\1>/gsi), (match) => ({
    label: match[1].toLowerCase() as "vocab" | "grammar",
    value: match[2].trim()
  })).filter((tag) => tag.value.length > 0);

export function ScriptEditor({
  initialValue = "The hero discovers <vocab>momentum</vocab> while the narrator models <grammar>present simple</grammar> in a neon training chamber."
}: ScriptEditorProps) {
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [title, setTitle] = useState("Neon Lesson 01");
  const [content, setContent] = useState(initialValue);
  const [status, setStatus] = useState(
    "Selecciona una palabra y aplica una etiqueta para guardarla en el pipeline."
  );
  const [knownScripts, setKnownScripts] = useState<ScriptRecord[]>([]);
  const [analysis, setAnalysis] = useState<ScriptAnalysis | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const detectedTags = useMemo(() => detectTags(content), [content]);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        const scripts = await api.listScripts();
        setKnownScripts(scripts);

        if (scripts[0]) {
          setScriptId(scripts[0].id);
          setTitle(scripts[0].title);
          setContent(scripts[0].content);
          setStatus("Guion cargado desde la API. Puedes editarlo y volver a sincronizar.");
        }
      } catch (_error) {
        setStatus("API no disponible. Puedes seguir editando en modo local.");
      }
    };

    void loadScripts();
  }, []);

  const wrapSelection = (label: "vocab" | "grammar") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.slice(selectionStart, selectionEnd).trim();

    if (!selectedText) {
      setStatus("Selecciona primero una palabra o frase antes de etiquetarla.");
      return;
    }

    const taggedText = `<${label}>${selectedText}</${label}>`;
    const nextValue =
      value.slice(0, selectionStart) + taggedText + value.slice(selectionEnd);

    setContent(nextValue);
    setStatus(
      `"${selectedText}" fue marcado como ${label} y está listo para sincronizarse con MongoDB Atlas.`
    );

    requestAnimationFrame(() => {
      const caretPosition = selectionStart + taggedText.length;
      textarea.focus();
      textarea.setSelectionRange(caretPosition, caretPosition);
    });
  };

  const saveScript = async () => {
    try {
      const payload = {
        title,
        content,
        sceneId: "scene_001"
      };

      const saved = scriptId
        ? await api.updateScript(scriptId, payload)
        : await api.createScript(payload);

      setScriptId(saved.id);
      setKnownScripts((current) => {
        const remaining = current.filter((entry) => entry.id !== saved.id);
        return [saved, ...remaining];
      });
      setStatus("Guion sincronizado con la API y listo para indexarse en MongoDB Atlas.");
    } catch (_error) {
      setStatus("No se pudo guardar en la API. Revisa que el backend esté activo.");
    }
  };

  const analyzeScript = async () => {
    try {
      setStatus("Analizando guion con la capa de IA...");
      const result = await api.analyzeScript(content);
      setAnalysis(result);
      setStatus(
        result.provider === "openai"
          ? "Análisis completado con OpenAI."
          : result.nextStep ?? "Análisis completado con el generador local."
      );
    } catch (_error) {
      setStatus("No se pudo analizar el guion en este momento.");
    }
  };

  const loadKnownScript = (nextId: string) => {
    const selected = knownScripts.find((entry) => entry.id === nextId);
    if (!selected) {
      return;
    }

    setScriptId(selected.id);
    setTitle(selected.title);
    setContent(selected.content);
    setStatus(`Cargaste "${selected.title}" desde el workspace de guiones.`);
  };

  return (
    <section className="editor-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">Script-Centric Workspace</p>
          <h2>Editor base para guiones educativos con tagging semántico.</h2>
        </div>

        <div className="editor-actions">
          <button type="button" onClick={() => wrapSelection("vocab")}>
            Etiquetar `vocab`
          </button>
          <button type="button" onClick={() => wrapSelection("grammar")}>
            Etiquetar `grammar`
          </button>
        </div>
      </div>

      <label className="editor-field">
        <span>Título del guion</span>
        <input
          className="script-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nombre del guion"
        />
      </label>

      <div className="editor-toolbar">
        <label className="script-picker">
          <span>Guiones guardados</span>
          <select
            value={scriptId ?? ""}
            onChange={(event) => loadKnownScript(event.target.value)}
          >
            <option value="">Nuevo guion</option>
            {knownScripts.map((script) => (
              <option key={script.id} value={script.id}>
                {script.title}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="primary-button" onClick={saveScript}>
          Guardar guion
        </button>
        <button type="button" className="secondary-button" onClick={analyzeScript}>
          Analizar con IA
        </button>
      </div>

      <label className="editor-field">
        <span>Guion activo</span>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          spellCheck={false}
        />
      </label>

      <div className="editor-meta">
        <div className="editor-status">
          <strong>Estado</strong>
          <p>{status}</p>
        </div>

        <div className="editor-status">
          <strong>Etiquetas detectadas</strong>
          <div className="tag-list">
            {detectedTags.length > 0 ? (
              detectedTags.map((tag) => (
                <span
                  key={`${tag.label}-${tag.value}`}
                  className={`tag-pill tag-pill--${tag.label}`}
                >
                  {tag.label}: {tag.value}
                </span>
              ))
            ) : (
              <span className="tag-pill">Sin etiquetas todavía</span>
            )}
          </div>
        </div>

        <div className="editor-status editor-status--wide">
          <strong>Visual Prompts</strong>
          {analysis?.visualPrompts?.length ? (
            <div className="prompt-list">
              {analysis.visualPrompts.map((prompt) => (
                <article key={prompt} className="prompt-card">
                  {prompt}
                </article>
              ))}
            </div>
          ) : (
            <p>Aún no hay sugerencias. Usa “Analizar con IA” para generarlas.</p>
          )}
        </div>
      </div>
    </section>
  );
}
