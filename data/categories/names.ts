import { IBGE_LOCALIDADES, normalize } from "./common.ts";
import { defineCategories } from "./types.ts";

// Só categorias que exigem saber algo além do nome exibido na busca (a sigla não aparece).
export default defineCategories([
  {
    id: "code-is-first-two-letters",
    family: "names",
    label: "Sigla = duas primeiras letras",
    description: "A sigla da UF são as duas primeiras letras do nome.",
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
    members: ["AC", "AP", "CE", "MA", "PA", "PB", "PR", "PE", "PI", "RR", "SE", "TO"],
    source: {
      name: "Wikipédia — Etimologia das unidades federativas do Brasil",
      url: "https://pt.wikipedia.org/wiki/Etimologia_das_unidades_federativas_do_Brasil",
    },
    notes:
      "Segue a própria tabela de classificação da página ('topônimos de origem ameríndia'), não só o Tupi: Acre vem do Apurinã ou Mundurucu, Roraima do Pemon/Ianomâmi/Caribe, o resto do Tupi (ou Tupi antigo). Mesmo quando há mais de uma hipótese (ex.: Acre, Amapá, Ceará, Maranhão), todas as hipóteses da página são de origem indígena, então não há ambiguidade de família de origem — só de qual língua/étnia exata.",
    difficulty: 3,
  },
]);
