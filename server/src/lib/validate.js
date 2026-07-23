// Valida a estrutura { idioma: { CATEGORIA: [string, ...] } } antes de gravar no S3.
// Devolve uma mensagem de erro (string) ou null se estiver ok.
export function validateKeywords(payload) {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return "O corpo deve ser um objeto de idiomas.";
  }
  for (const [lang, cats] of Object.entries(payload)) {
    if (typeof cats !== "object" || cats === null || Array.isArray(cats)) {
      return `O idioma "${lang}" deve ser um objeto de categorias.`;
    }
    for (const [cat, words] of Object.entries(cats)) {
      if (!Array.isArray(words)) return `A categoria "${lang}.${cat}" deve ser uma lista.`;
      if (!words.every((w) => typeof w === "string")) {
        return `A categoria "${lang}.${cat}" deve conter apenas texto.`;
      }
    }
  }
  return null;
}
