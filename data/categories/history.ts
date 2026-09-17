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
]);
