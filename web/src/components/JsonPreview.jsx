import React, { useState } from "react";
import { Copy, Check, CloudUpload } from "lucide-react";
import { publishToS3 } from "../lib/api.js";

const PUB_MSG = {
  publishing: "Publicando…",
  ok: "Publicado no S3.",
  error: "Falha ao publicar — verifique o backend.",
  noconfig: "Endpoint do backend ainda não configurado.",
};

export default function JsonPreview({ data }) {
  const [copied, setCopied] = useState(false);
  const [pub, setPub] = useState(""); // '' | publishing | ok | error | noconfig

  function handleCopy() {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1600); })
      .catch(() => {});
  }

  async function handlePublish() {
    setPub("publishing");
    try {
      await publishToS3(data);
      setPub("ok");
      setTimeout(() => setPub(""), 2600);
    } catch (err) {
      setPub(err.message === "not-configured" ? "noconfig" : "error");
      setTimeout(() => setPub(""), 4200);
    }
  }

  return (
    <section className="sb-panel sb-jsonpanel">
      <div className="sb-jsonhead">
        <span>category-keywords.json</span>
        <div className="sb-jsonbtns">
          <button className="sb-copy" onClick={handleCopy}>
            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
          </button>
          <button className="sb-pub" onClick={handlePublish} disabled={pub === "publishing"}>
            <CloudUpload size={14} /> {pub === "publishing" ? "Publicando…" : "Publicar no S3"}
          </button>
        </div>
      </div>
      {pub && <div className={`sb-pubbar sb-${pub}`}><span className="sb-pubdot" />{PUB_MSG[pub]}</div>}
      <pre className="sb-json">{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
}
