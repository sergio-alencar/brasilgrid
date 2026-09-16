export type UfCode =
  | 'AC' | 'AL' | 'AP' | 'AM' | 'BA' | 'CE' | 'DF' | 'ES' | 'GO' | 'MA' | 'MT' | 'MS' | 'MG' | 'PA'
  | 'PB' | 'PR' | 'PE' | 'PI' | 'RJ' | 'RN' | 'RS' | 'RO' | 'RR' | 'SC' | 'SP' | 'SE' | 'TO'

export interface UfRecord {
  code: UfCode
  ibgeId: number
  name: string
  region: 'N' | 'NE' | 'CO' | 'SE' | 'S'
  population2022: number
  areaKm2: number
  municipalityCount: number
  capital: { name: string; ibgeId: number; population2022: number; isLargestCity: boolean }
  largestCity: { name: string; ibgeId: number; population2022: number }
  neighborUfs: UfCode[]
  neighborCountries: string[]
  territory: Record<'legalAmazon' | 'sudene' | 'seaFacing' | 'semiarid' | 'northernHemisphere', boolean>
  /** Nº de municípios por bioma predominante (IBGE 2024). */
  predominantBiomes: Partial<Record<Biome, number>>
}

export type Biome = 'Amazônia' | 'Caatinga' | 'Cerrado' | 'Mata Atlântica' | 'Pampa' | 'Pantanal'
