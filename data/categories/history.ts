import { defineCategories } from "./types.ts";

export default defineCategories([
  {
    id: "former-federal-territory",
    family: "history",
    label: "Já foi território federal",
    description: "A UF foi território federal antes de virar estado.",
    members: ["AC", "AP", "RO", "RR"],
    source: {
      name: "Wikipédia — Territórios federais do Brasil",
      url: "https://pt.wikipedia.org/wiki/Territ%C3%B3rios_federais_do_Brasil",
    },
    notes: "",
    difficulty: 2,
  },
  {
    id: "created-1960-or-later",
    family: "history",
    label: "UF criada a partir de 1960",
    description: "A UF passou a existir como estado em 1960 ou depois.",
    members: ["AC", "AP", "DF", "MS", "RO", "RR", "TO"],
    source: {
      name: "Wikipédia — Unidades federativas do Brasil",
      url: "https://pt.wikipedia.org/wiki/Unidades_federativas_do_Brasil",
    },
    notes: "Vale a data da lei de criação.",
    difficulty: 2,
  },
  {
    id: "birthplace-of-president",
    family: "history",
    label: "Berço de presidente da República",
    description: "A UF é o estado natal de pelo menos um presidente da República que tomou posse de fato.",
    members: ["AL", "BA", "CE", "MA", "MG", "MS", "MT", "PB", "PE", "RJ", "RN", "RS", "SC", "SP"],
    source: {
      name: "Wikipédia — Lista de presidentes do Brasil por nascimento",
      url: "https://pt.wikipedia.org/wiki/Lista_de_presidentes_do_Brasil_por_nascimento",
    },
    notes:
      "Só conta quem de fato tomou posse (fica de fora Júlio Prestes, Tancredo Neves e Pedro Aleixo, que nunca assumiram, e as juntas governativas de 1930 e 1969, que não são presidentes individuais). Itamar Franco: o registro oficial diz Bahia, embora haja uma hipótese de Minas Gerais (certidão de batismo); usamos o registro oficial. Jânio Quadros nasceu em Campo Grande quando ainda era Mato Grosso (antes da divisão de 1977); contamos pelo estado atual (MS).",
    difficulty: 2,
  },
]);
