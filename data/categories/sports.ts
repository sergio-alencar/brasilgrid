import { defineCategories } from "./types.ts";

export default defineCategories([
  {
    id: "world-cup-2014-host",
    family: "sports",
    label: "Sediou jogos da Copa de 2014",
    description: "Uma cidade da UF foi sede de jogos da Copa do Mundo FIFA de 2014.",
    labelEn: "Hosted 2014 World Cup matches",
    descriptionEn: "A city in the state hosted matches of the 2014 FIFA World Cup.",
    labelEs: "Sede de la Copa 2014",
    descriptionEs: "Una ciudad de la UF fue sede de partidos de la Copa del Mundo FIFA 2014.",
    members: ["AM", "BA", "CE", "DF", "MG", "MT", "PE", "PR", "RJ", "RN", "RS", "SP"],
    source: {
      name: "Wikipédia — Copa do Mundo FIFA de 2014",
      url: "https://pt.wikipedia.org/wiki/Copa_do_Mundo_FIFA_de_2014",
    },
    notes: "",
    difficulty: 2,
  },
  {
    id: "brazilian-champion-club",
    family: "sports",
    label: "Tem clube campeão brasileiro",
    description:
      "Algum clube da UF tem título de campeão brasileiro reconhecido pela CBF (inclui Taça Brasil e Robertão).",
    labelEn: "Has a national champion club",
    descriptionEn:
      "Some club from the state has a Brazilian championship title recognized by the CBF (includes the Taça Brasil and Robertão eras).",
    labelEs: "Tiene campeón brasileño",
    descriptionEs:
      "Algún club de la UF tiene título de campeón brasileño reconocido por la CBF (incluye la Taça Brasil y el Robertão).",
    members: ["BA", "MG", "PE", "PR", "RJ", "RS", "SP"],
    source: {
      name: "Wikipédia — Campeonato Brasileiro de Futebol",
      url: "https://pt.wikipedia.org/wiki/Campeonato_Brasileiro_de_Futebol",
    },
    notes: "",
    difficulty: 2,
  },
  {
    id: "libertadores-champion-club",
    family: "sports",
    label: "Tem campeão da Libertadores",
    description: "Algum clube da UF já venceu a Copa Libertadores da América.",
    labelEn: "Has a Libertadores champion club",
    descriptionEn: "Some club from the state has won the Copa Libertadores.",
    labelEs: "Tiene campeón de Libertadores",
    descriptionEs: "Algún club de la UF ha ganado la Copa Libertadores de América.",
    members: ["MG", "RJ", "RS", "SP"],
    source: {
      name: "Wikipédia — Copa Libertadores da América",
      url: "https://pt.wikipedia.org/wiki/Copa_Libertadores_da_Am%C3%A9rica",
    },
    difficulty: 2,
  },
  {
    id: "copa-do-brasil-champion-club",
    family: "sports",
    label: "Tem campeão da Copa do Brasil",
    description: "Algum clube da UF já venceu a Copa do Brasil.",
    labelEn: "Copa do Brasil champion club",
    descriptionEn: "Some club from the state has won the Copa do Brasil.",
    labelEs: "Campeón de la Copa de Brasil",
    descriptionEs: "Algún club de la UF ha ganado la Copa do Brasil.",
    members: ["MG", "PE", "PR", "RJ", "RS", "SC", "SP"],
    source: {
      name: "Wikipédia — Copa do Brasil de Futebol",
      url: "https://pt.wikipedia.org/wiki/Copa_do_Brasil_de_Futebol",
    },
    notes: "",
    difficulty: 2,
  },
]);
