import { defineCategories } from "./types.ts";

export default defineCategories([
  {
    id: "legal-amazon",
    family: "politics",
    label: "Parte da Amazônia Legal",
    description:
      "A UF tem ao menos um município na Amazônia Legal, segundo a lista oficial do IBGE (2024).",
    members: ["AC", "AM", "AP", "MA", "MT", "PA", "RO", "RR", "TO"],
    source: {
      name: "IBGE — Municípios da Amazônia Legal (2024)",
      url: "https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/amazonia_legal/2024/",
    },
    notes: "",
    difficulty: 2,
    derive: (uf) => uf.territory.legalAmazon,
  },
  {
    id: "sudene-area",
    family: "politics",
    label: "Área de atuação da SUDENE",
    description:
      "A UF tem ao menos um município na área de atuação da SUDENE, segundo a lista oficial do IBGE (2021).",
    members: ["AL", "BA", "CE", "ES", "MA", "MG", "PB", "PE", "PI", "RN", "SE"],
    source: {
      name: "IBGE — Área de atuação da SUDENE (2021)",
      url: "https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/area_atuacao_SUDENE/2021/",
    },
    notes: "",
    difficulty: 3,
    derive: (uf) => uf.territory.sudene,
  },
  {
    id: "trf-seat",
    family: "politics",
    label: "Sede de um TRF",
    description: "A capital da UF sedia um dos seis Tribunais Regionais Federais.",
    members: ["DF", "MG", "PE", "RJ", "RS", "SP"],
    source: { name: "CJF — Tribunais Regionais Federais", url: "https://www.cjf.jus.br/cjf/" },
    notes: "",
    difficulty: 3,
  },
  {
    id: "capital-timezone-not-brasilia",
    family: "coast",
    label: "Capital em outro fuso horário",
    description: "A capital da UF usa um fuso diferente do horário de Brasília (UTC−3).",
    members: ["AC", "AM", "MS", "MT", "RO", "RR"],
    source: {
      name: "Lei 12.876/2013 (fusos horários)",
      url: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/lei/l12876.htm",
    },
    notes: "",
    difficulty: 2,
  },
  {
    id: "capital-on-island",
    family: "capitals",
    label: "Capital fica numa ilha",
    description: "A sede da capital fica numa ilha.",
    members: ["ES", "MA", "SC"],
    source: {
      name: "Wikipédia — Capitais do Brasil",
      url: "https://pt.wikipedia.org/wiki/Capitais_do_Brasil",
    },
    notes: "",
    difficulty: 2,
  },
  {
    id: "density-over-50",
    family: "demography",
    label: "Mais de 50 hab./km²",
    description: "A densidade demográfica da UF passa de 50 habitantes por km² (Censo 2022).",
    members: ["AL", "CE", "DF", "ES", "PB", "PE", "PR", "RJ", "RN", "SC", "SE", "SP"],
    source: {
      name: "IBGE — Censo Demográfico 2022 (SIDRA, tabela 4714)",
      url: "https://sidra.ibge.gov.br/tabela/4714",
    },
    difficulty: 3,
    numeric: { metric: (uf) => uf.population2022 / uf.areaKm2, op: ">", threshold: 50 },
  },
]);
