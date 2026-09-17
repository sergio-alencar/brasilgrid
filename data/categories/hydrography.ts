import { defineCategories } from "./types.ts";

const wiki = (page: string, title: string) => ({
  name: `Wikipédia — ${title}`,
  url: `https://pt.wikipedia.org/wiki/${page}`,
});

export default defineCategories([
  {
    id: "river-sao-francisco",
    family: "hydrography",
    label: "Banhado pelo São Francisco",
    description: "O Rio São Francisco atravessa a UF ou forma parte de sua divisa.",
    members: ["AL", "BA", "MG", "PE", "SE"],
    source: wiki("Rio_S%C3%A3o_Francisco", "Rio São Francisco"),
    notes: "",
    difficulty: 2,
  },
  {
    id: "river-tocantins",
    family: "hydrography",
    label: "Banhado pelo Rio Tocantins",
    description: "O Rio Tocantins atravessa a UF ou forma parte de sua divisa.",
    members: ["GO", "MA", "PA", "TO"],
    source: wiki("Rio_Tocantins", "Rio Tocantins"),
    notes: "",
    difficulty: 2,
  },
  {
    id: "river-araguaia",
    family: "hydrography",
    label: "Banhado pelo Rio Araguaia",
    description: "O Rio Araguaia atravessa a UF ou forma parte de sua divisa.",
    members: ["GO", "MT", "PA", "TO"],
    source: wiki("Rio_Araguaia", "Rio Araguaia"),
    notes: "",
    difficulty: 2,
  },
  {
    id: "river-parana",
    family: "hydrography",
    label: "Banhado pelo Rio Paraná",
    description: "O Rio Paraná atravessa a UF ou forma parte de sua divisa.",
    members: ["MS", "PR", "SP"],
    source: wiki("Rio_Paran%C3%A1", "Rio Paraná"),
    notes: "",
    difficulty: 2,
  },
  {
    id: "river-paraiba-do-sul",
    family: "hydrography",
    label: "Banhado pelo Paraíba do Sul",
    description: "O Rio Paraíba do Sul atravessa a UF ou forma parte de sua divisa.",
    members: ["MG", "RJ", "SP"],
    source: wiki("Rio_Para%C3%ADba_do_Sul", "Rio Paraíba do Sul"),
    notes: "",
    difficulty: 3,
  },
  {
    id: "basin-sao-francisco",
    family: "hydrography",
    label: "Na bacia do São Francisco",
    description: "A UF tem parte do território na bacia hidrográfica do Rio São Francisco.",
    members: ["AL", "BA", "DF", "GO", "MG", "PE", "SE"],
    source: {
      name: "CBHSF — Comitê da Bacia Hidrográfica do Rio São Francisco",
      url: "https://cbhsaofrancisco.org.br/a-bacia/",
    },
    notes: "",
    difficulty: 2,
  },
]);
