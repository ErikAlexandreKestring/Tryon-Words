import React, { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import { LANGS, CATS, norm, addKeyword, removeKeyword } from "../lib/keywords.js";

export default function KeywordEditor({ data, setData }) {
  const [lang, setLang] = useState("br");
  const [cat, setCat] = useState("FULL_BODY");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [dup, setDup] = useState(false);

  const arr = data[lang][cat];
  const q = norm(query);
  const shown = arr.filter((w) => !q || w.includes(q));
  const catLabel = CATS.find((c) => c.key === cat)?.label;

  function handleAdd() {
    const { data: next, added, reason } = addKeyword(data, lang, cat, draft);
    if (!added) { if (reason === "duplicate") setDup(true); return; }
    setData(next);
    setDraft("");
    setDup(false);
  }

  function handleRemove(word) {
    setData(removeKeyword(data, lang, cat, word));
  }

  return (
    <section className="sb-panel">
      <div className="sb-selects">
        <label className="sb-field">
          <span>Idioma</span>
          <select value={lang} onChange={(e) => { setLang(e.target.value); setDup(false); }}>
            {LANGS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>
        </label>
        <label className="sb-field">
          <span>Categoria</span>
          <select value={cat} onChange={(e) => { setCat(e.target.value); setDup(false); }}>
            {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </label>
      </div>

      <div className="sb-addrow">
        <input
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setDup(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          placeholder="Nova palavra-chave…"
        />
        <button className="sb-add" onClick={handleAdd}><Plus size={16} /> Adicionar</button>
      </div>
      {dup && <p className="sb-dup">Essa palavra já existe em {catLabel}.</p>}

      <div className="sb-search">
        <Search size={15} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Consultar palavra…" />
        {query && <button className="sb-clear" onClick={() => setQuery("")} aria-label="Limpar"><X size={13} /></button>}
      </div>

      <div className="sb-listhead">
        <span>{catLabel}</span>
        <span className="sb-count">
          {q ? `${shown.length} de ${arr.length}` : `${arr.length} palavra${arr.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="sb-empty">{q ? `Nada encontrado para “${query}”.` : "Nenhuma palavra nesta categoria."}</p>
      ) : (
        <div className="sb-chips">
          {shown.map((w) => (
            <span key={w} className="sb-chip">{w}
              <button className="sb-chip-x" onClick={() => handleRemove(w)} aria-label={`Remover ${w}`}><X size={13} /></button>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
