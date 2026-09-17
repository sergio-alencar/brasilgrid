import { defineCategories } from "./types.ts";

const UNESCO = {
  name: "Wikipédia — Lista do Patrimônio Mundial no Brasil",
  url: "https://pt.wikipedia.org/wiki/Lista_do_Patrim%C3%B4nio_Mundial_no_Brasil",
};

export default defineCategories([
  {
    id: "unesco-cultural",
    family: "culture",
    label: "Patrimônio Cultural da UNESCO",
    description:
      "A UF tem um bem cultural ou misto inscrito na lista do Patrimônio Mundial da UNESCO.",
    members: ["AM", "BA", "DF", "GO", "MA", "MG", "PA", "PE", "PI", "RJ", "RS", "SE"],
    source: UNESCO,
    notes: "",
    difficulty: 2,
  },
  {
    id: "unesco-natural",
    family: "culture",
    label: "Patrimônio Natural da UNESCO",
    description:
      "A UF tem um bem natural ou misto inscrito na lista do Patrimônio Mundial da UNESCO.",
    members: ["AM", "BA", "ES", "GO", "MA", "MG", "MS", "MT", "PE", "PR", "RJ", "RN", "SP"],
    source: UNESCO,
    notes: "",
    difficulty: 3,
  },
  {
    id: "no-unesco-site",
    family: "culture",
    label: "Sem Patrimônio Mundial",
    description: "A UF não tem nenhum bem inscrito na lista do Patrimônio Mundial da UNESCO.",
    members: ["AC", "AL", "AP", "CE", "PB", "RO", "RR", "SC", "TO"],
    source: UNESCO,
    difficulty: 3,
  },
]);
