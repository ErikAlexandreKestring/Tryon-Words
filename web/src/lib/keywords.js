// Constantes de idioma/categoria e helpers puros de manipulação das palavras.

export const LANGS = [
  { key: "br", label: "Português (BR)" },
  { key: "es", label: "Espanhol (ES)" },
  { key: "en", label: "Inglês (EN)" },
  { key: "it", label: "Italiano (IT)" },
];

export const CATS = [
  { key: "FULL_BODY", label: "Corpo inteiro" },
  { key: "UPPER_BODY", label: "Parte de cima" },
  { key: "LOWER_BODY", label: "Parte de baixo" },
];

// normaliza: sem espaços nas pontas, minúsculas, espaços internos colapsados
export const norm = (w) => w.trim().toLowerCase().replace(/\s+/g, " ");

// adiciona uma palavra; devolve { data, added, reason }
export function addKeyword(data, lang, cat, word) {
  const w = norm(word);
  if (!w) return { data, added: false, reason: "empty" };
  if (data[lang][cat].includes(w)) return { data, added: false, reason: "duplicate" };
  const next = structuredClone(data);
  next[lang][cat] = [...next[lang][cat], w];
  return { data: next, added: true };
}

// remove uma palavra; devolve o novo objeto
export function removeKeyword(data, lang, cat, word) {
  const next = structuredClone(data);
  next[lang][cat] = next[lang][cat].filter((x) => x !== word);
  return next;
}

// remove duplicatas dentro de cada categoria (útil ao importar/carregar)
export function dedupe(data) {
  const next = structuredClone(data);
  for (const lang of Object.keys(next)) {
    for (const cat of Object.keys(next[lang])) {
      const seen = new Set();
      next[lang][cat] = next[lang][cat]
        .map(norm)
        .filter((w) => w && !seen.has(w) && seen.add(w));
    }
  }
  return next;
}
