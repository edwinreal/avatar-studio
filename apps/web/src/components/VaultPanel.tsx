import { useEffect, useState } from "react";
import { api, type VaultRecord, type VocabularyRecord } from "../lib/api";

export function VaultPanel() {
  const [assets, setAssets] = useState<VaultRecord[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabularyRecord[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [status, setStatus] = useState(
    "Importa una URL de imagen o video para asociarla a una palabra del Vault."
  );

  const loadVault = async () => {
    const [vaultItems, vocabularyItems] = await Promise.all([
      api.listVault(),
      api.listVocabulary()
    ]);

    setAssets(vaultItems);
    setVocabulary(vocabularyItems);

    if (!selectedVocabulary && vocabularyItems[0]) {
      setSelectedVocabulary(vocabularyItems[0].id);
    }
  };

  useEffect(() => {
    void loadVault().catch(() => {
      setStatus("No se pudo cargar el Vault todavía.");
    });
  }, []);

  const importAsset = async () => {
    const selected = vocabulary.find((entry) => entry.id === selectedVocabulary);

    if (!selected || !sourceUrl) {
      setStatus("Selecciona vocabulario y una URL válida antes de importar.");
      return;
    }

    try {
      const result = await api.importVaultAsset({
        vocabularyId: selected.id,
        sceneId: selected.sceneId ?? "scene_001",
        sourceUrl,
        notes: `Imported asset for ${selected.term}`
      });

      setAssets((current) => [result.item, ...current]);
      setSourceUrl("");
      setStatus(
        result.provider === "cloudinary"
          ? "Asset subido a Cloudinary y vinculado al Vault."
          : "Cloudinary no está configurado; se guardó una referencia local de fallback."
      );
    } catch (_error) {
      setStatus("No se pudo importar el asset al Vault.");
    }
  };

  return (
    <section className="vault-panel">
      <div className="panel-heading">
        <div>
          <p className="panel-kicker">The Vault</p>
          <h2>Memoria visual para escenas, vocabulario y assets enlazados.</h2>
        </div>
      </div>

      <div className="vault-toolbar">
        <label className="script-picker">
          <span>Palabra objetivo</span>
          <select
            value={selectedVocabulary}
            onChange={(event) => setSelectedVocabulary(event.target.value)}
          >
            <option value="">Selecciona vocabulario</option>
            {vocabulary.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.term} ({entry.type})
              </option>
            ))}
          </select>
        </label>

        <label className="script-picker vault-url-field">
          <span>URL del asset</span>
          <input
            className="script-input"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://..."
          />
        </label>

        <button type="button" className="primary-button" onClick={importAsset}>
          Importar al Vault
        </button>
      </div>

      <div className="editor-status editor-status--wide">
        <strong>Estado del Vault</strong>
        <p>{status}</p>
      </div>

      <div className="vault-grid">
        {assets.map((asset) => (
          <article key={asset.id} className="vault-card">
            <p className="panel-kicker">{asset.assetType}</p>
            <strong>{asset.cloudinaryPublicId}</strong>
            <p>{asset.notes}</p>
            {asset.secureUrl ? (
              <a href={asset.secureUrl} target="_blank" rel="noreferrer">
                Ver asset
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
