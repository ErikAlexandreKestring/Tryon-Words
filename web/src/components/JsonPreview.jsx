import React, { useState } from "react";
import { Copy, Check, CloudUpload, RefreshCw } from "lucide-react";
import { publishToS3, loadFromS3 } from "../lib/api.js";

const STATUS_MSG = {
  sync: {
    busy: "Sincronizando…",
    ok: "Sincronizado com o S3.",
    error: "Falha ao sincronizar — verifique o backend.",
    noconfig: "Endpoint do backend ainda não configurado.",
  },
  publish: {
    busy: "Publicando…",
    ok: "Publicado no S3.",
    error: "Falha ao publicar — verifique o backend.",
    noconfig: "Endpoint do backend ainda não configurado.",
  },
};

export default function JsonPreview({ data, setData }) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(null); // { action: 'sync' | 'publish', state: 'busy' | 'ok' | 'error' | 'noconfig' }

  function handleCopy() {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); })
      .catch(() => {});
  }

  async function handleSync() {
    setStatus({ action: "sync", state: "busy" });
    try {
      const remote = await loadFromS3();
      setData(remote);
      setStatus({ action: "sync", state: "ok" });
      setTimeout(() => setStatus(null), 2600);
    } catch (err) {
      setStatus({ action: "sync", state: err.message === "not-configured" ? "noconfig" : "error" });
      setTimeout(() => setStatus(null), 4200);
    }
  }

  async function handlePublish() {
    setStatus({ action: "publish", state: "busy" });
    try {
      await publishToS3(data);
      setStatus({ action: "publish", state: "ok" });
      setTimeout(() => setStatus(null), 2600);
    } catch (err) {
      setStatus({ action: "publish", state: err.message === "not-configured" ? "noconfig" : "error" });
      setTimeout(() => setStatus(null), 4200);
    }
  }

  const busy = status?.state === "busy";

  return (
    <section className="sb-panel sb-jsonpanel">
      <div className="sb-jsonhead">
        <span>category-keywords.json</span>
        <div className="sb-jsonbtns">
          <button className="sb-copy" onClick={handleCopy}>
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
          </button>
          <button className="sb-sync" onClick={handleSync} disabled={busy}>
            <RefreshCw size={14} /> {status?.action === "sync" && busy ? "Sincronizando…" : "Sincronizar"}
          </button>
          <button className="sb-pub" onClick={handlePublish} disabled={busy}>
            <CloudUpload size={14} /> {status?.action === "publish" && busy ? "Publicando…" : "Publicar no S3"}
          </button>
        </div>
      </div>
      {status && (
        <div className={`sb-pubbar sb-${status.state}`}>
          <span className="sb-pubdot" />{STATUS_MSG[status.action][status.state]}
        </div>
      )}
      <pre className="sb-json">{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
