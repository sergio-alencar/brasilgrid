import type { Biome, UfRecord } from "./ufData.ts";
import { defineCategories } from "./types.ts";

const IBGE_BIOMES = {
  name: "IBGE — Bioma predominante por município para fins estatísticos (2024)",
  url: "https://geoftp.ibge.gov.br/informacoes_ambientais/estudos_ambientais/biomas/documentos/",
};
const IBGE_SEMIARID = {
  name: "IBGE — Municípios do Semiárido (2022)",
  url: "https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/semiarido_brasileiro/Situacao_2022/",
};

const hasBiome = (biome: Biome) => (uf: UfRecord) => (uf.predominantBiomes[biome] ?? 0) > 0;
const biomeCount = (uf: UfRecord) =>
  Object.values(uf.predominantBiomes).filter((n) => n && n > 0).length;

const RULE =
  "Conta se ao menos um município da UF tem esse bioma como predominante, segundo o IBGE (2024). Faixas pequenas de um bioma dentro de municípios onde outro predomina não contam.";
const RULE_EN =
  "Counts if at least one municipality in the state has this biome as predominant, per IBGE (2024). Small patches of a biome inside municipalities where another one predominates do not count.";
const RULE_ES =
  "Cuenta si al menos un municipio de la UF tiene este bioma como predominante, según el IBGE (2024). Las pequeñas franjas de un bioma dentro de municipios donde predomina otro no cuentan.";

export default defineCategories([
  {
    id: "biome-amazon",
    family: "biomes",
    label: "Tem Amazônia",
    description: `A UF tem municípios no bioma Amazônia. ${RULE}`,
    labelEn: "Has Amazon biome",
    descriptionEn: `The state has municipalities in the Amazon biome. ${RULE_EN}`,
    labelEs: "Tiene bioma Amazônia",
    descriptionEs: `La UF tiene municipios en el bioma Amazônia. ${RULE_ES}`,
    members: ["AC", "AM", "AP", "MA", "MT", "PA", "RO", "RR", "TO"],
    source: IBGE_BIOMES,
    difficulty: 1,
    derive: hasBiome("Amazônia"),
  },
  {
    id: "biome-caatinga",
    family: "biomes",
    label: "Tem Caatinga",
    description: `A UF tem municípios no bioma Caatinga. ${RULE}`,
    labelEn: "Has Caatinga biome",
    descriptionEn: `The state has municipalities in the Caatinga biome. ${RULE_EN}`,
    labelEs: "Tiene bioma Caatinga",
    descriptionEs: `La UF tiene municipios en el bioma Caatinga. ${RULE_ES}`,
    members: ["AL", "BA", "CE", "MG", "PB", "PE", "PI", "RN", "SE"],
    source: IBGE_BIOMES,
    notes: "",
    difficulty: 2,
    derive: hasBiome("Caatinga"),
  },
  {
    id: "biome-cerrado",
    family: "biomes",
    label: "Tem Cerrado",
    description: `A UF tem municípios no bioma Cerrado. ${RULE}`,
    labelEn: "Has Cerrado biome",
    descriptionEn: `The state has municipalities in the Cerrado biome. ${RULE_EN}`,
    labelEs: "Tiene bioma Cerrado",
    descriptionEs: `La UF tiene municipios en el bioma Cerrado. ${RULE_ES}`,
    members: ["BA", "DF", "GO", "MA", "MG", "MS", "MT", "PI", "PR", "SP", "TO"],
    source: IBGE_BIOMES,
    notes: "",
    difficulty: 2,
    derive: hasBiome("Cerrado"),
  },
  {
    id: "biome-atlantic-forest",
    family: "biomes",
    label: "Tem Mata Atlântica",
    description: `A UF tem municípios no bioma Mata Atlântica. ${RULE}`,
    labelEn: "Has Atlantic Forest biome",
    descriptionEn: `The state has municipalities in the Atlantic Forest biome. ${RULE_EN}`,
    labelEs: "Tiene Mata Atlântica",
    descriptionEs: `La UF tiene municipios en el bioma Mata Atlântica. ${RULE_ES}`,
    members: [
      "AL",
      "BA",
      "ES",
      "GO",
      "MG",
      "MS",
      "PB",
      "PE",
      "PR",
      "RJ",
      "RN",
      "RS",
      "SC",
      "SE",
      "SP",
    ],
    source: IBGE_BIOMES,
    difficulty: 2,
    derive: hasBiome("Mata Atlântica"),
  },
  {
    id: "biome-pantanal",
    family: "biomes",
    label: "Tem Pantanal",
    description: `A UF tem municípios no bioma Pantanal. ${RULE}`,
    labelEn: "Has Pantanal biome",
    descriptionEn: `The state has municipalities in the Pantanal biome. ${RULE_EN}`,
    labelEs: "Tiene bioma Pantanal",
    descriptionEs: `La UF tiene municipios en el bioma Pantanal. ${RULE_ES}`,
    members: ["MS", "MT"],
    source: IBGE_BIOMES,
    difficulty: 3,
    derive: hasBiome("Pantanal"),
  },
  {
    id: "single-biome",
    family: "biomes",
    label: "Um único bioma",
    description: `Todos os municípios da UF têm o mesmo bioma predominante. ${RULE}`,
    labelEn: "Only one biome",
    descriptionEn: `Every municipality in the state shares the same predominant biome. ${RULE_EN}`,
    labelEs: "Un único bioma",
    descriptionEs: `Todos los municipios de la UF tienen el mismo bioma predominante. ${RULE_ES}`,
    members: ["AC", "AM", "AP", "CE", "DF", "ES", "PA", "RJ", "RO", "RR", "SC"],
    source: IBGE_BIOMES,
    difficulty: 2,
    derive: (uf) => biomeCount(uf) === 1,
  },
  {
    id: "three-biomes",
    family: "biomes",
    label: "Três biomas ou mais",
    description: `Os municípios da UF se dividem em pelo menos três biomas predominantes. ${RULE}`,
    labelEn: "3+ biomes",
    descriptionEn: `The municipalities in the state are split across at least three predominant biomes. ${RULE_EN}`,
    labelEs: "Tres biomas o más",
    descriptionEs: `Los municipios de la UF se reparten en al menos tres biomas predominantes. ${RULE_ES}`,
    members: ["BA", "MG", "MS", "MT"],
    source: IBGE_BIOMES,
    difficulty: 3,
    derive: (uf) => biomeCount(uf) >= 3,
  },
  {
    id: "semiarid",
    family: "biomes",
    label: "Tem área no Semiárido",
    description:
      "A UF tem ao menos um município na delimitação oficial do Semiárido brasileiro (SUDENE, 2022).",
    labelEn: "Has Semiarid territory",
    descriptionEn:
      "The state has at least one municipality within the official boundary of the Brazilian Semiarid region (SUDENE, 2022).",
    labelEs: "Tiene territorio Semiárido",
    descriptionEs:
      "La UF tiene al menos un municipio dentro de la delimitación oficial del Semiárido brasileño (SUDENE, 2022).",
    members: ["AL", "BA", "CE", "ES", "MA", "MG", "PB", "PE", "PI", "RN", "SE"],
    source: IBGE_SEMIARID,
    notes: "",
    difficulty: 3,
    derive: (uf) => uf.territory.semiarid,
  },
]);
