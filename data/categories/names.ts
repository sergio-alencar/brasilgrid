import { IBGE_LOCALIDADES, normalize } from "./common.ts";
import { defineCategories } from "./types.ts";

// Só categorias que exigem saber algo além do nome exibido na busca (a sigla não aparece).
export default defineCategories([
  {
    id: "code-is-first-two-letters",
    family: "names",
    label: "Sigla = duas primeiras letras",
    description: "A sigla da UF são as duas primeiras letras do nome.",
    labelEn: "Code = first two letters",
    descriptionEn: "The state's postal code is the first two letters of its name.",
    labelEs: "Sigla = dos primeras letras",
    descriptionEs: "La sigla de la UF son las dos primeras letras del nombre.",
    members: ["AC", "AL", "AM", "BA", "CE", "ES", "GO", "MA", "PA", "PE", "PI", "RO", "SE", "TO"],
    source: IBGE_LOCALIDADES,
    difficulty: 2,
    derive: (uf) => normalize(uf.name).slice(0, 2).toUpperCase() === uf.code,
  },
  {
    id: "name-indigenous-origin",
    family: "names",
    label: "Nome de origem indígena",
    description: "O nome da UF vem de uma língua indígena (Tupi ou outra).",
    labelEn: "Name of indigenous origin",
    descriptionEn: "The state's name comes from an indigenous language (Tupi or another).",
    labelEs: "Nombre de origen indígena",
    descriptionEs: "El nombre de la UF proviene de una lengua indígena (Tupí u otra).",
    members: ["AC", "AP", "CE", "MA", "PA", "PB", "PR", "PE", "PI", "RR", "SE", "TO"],
    source: {
      name: "Wikipédia — Etimologia das unidades federativas do Brasil",
      url: "https://pt.wikipedia.org/wiki/Etimologia_das_unidades_federativas_do_Brasil",
    },
    notes:
      "Segue a própria tabela de classificação da página ('topônimos de origem ameríndia'), não só o Tupi: Acre vem do Apurinã ou Mundurucu, Roraima do Pemon/Ianomâmi/Caribe, o resto do Tupi (ou Tupi antigo). Mesmo quando há mais de uma hipótese (ex.: Acre, Amapá, Ceará, Maranhão), todas as hipóteses da página são de origem indígena, então não há ambiguidade de família de origem — só de qual língua/étnia exata.",
    notesEn:
      "Follows the page's own classification table ('Amerindian-origin place names'), not just Tupi: Acre comes from Apurinã or Mundurucu, Roraima from Pemon/Yanomami/Carib, the rest from Tupi (or Old Tupi). Even where there's more than one hypothesis (e.g. Acre, Amapá, Ceará, Maranhão), every hypothesis on the page is of indigenous origin, so there's no ambiguity about the origin family — only about the exact language/ethnic group.",
    notesEs:
      "Sigue la propia tabla de clasificación de la página ('topónimos de origen amerindio'), no solo el Tupí: Acre proviene del Apurinã o Munduruku, Roraima del Pemon/Yanomami/Caribe, el resto del Tupí (o Tupí antiguo). Incluso cuando hay más de una hipótesis (ej.: Acre, Amapá, Ceará, Maranhão), todas las hipótesis de la página son de origen indígena, por lo que no hay ambigüedad en la familia de origen — solo en la lengua/etnia exacta.",
    difficulty: 3,
  },
]);
