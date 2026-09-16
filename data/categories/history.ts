import { defineCategories } from './types.ts'

export default defineCategories([
  {
    id: 'former-federal-territory',
    family: 'history',
    label: 'Já foi território federal',
    description: 'A UF foi território federal antes de virar estado.',
    members: ['AC', 'AP', 'RO', 'RR'],
    source: { name: 'Wikipédia — Territórios federais do Brasil', url: 'https://pt.wikipedia.org/wiki/Territ%C3%B3rios_federais_do_Brasil' },
    notes: 'Fernando de Noronha também foi território, mas hoje é parte de Pernambuco, que não conta.',
    difficulty: 2,
  },
  {
    id: 'created-1960-or-later',
    family: 'history',
    label: 'UF criada a partir de 1960',
    description:
      'A UF passou a existir como estado (ou Distrito Federal) em 1960 ou depois: DF (1960), AC (1962), MS (1977), RO (1981), e AP, RR e TO (1988).',
    members: ['AC', 'AP', 'DF', 'MS', 'RO', 'RR', 'TO'],
    source: { name: 'Wikipédia — Unidades federativas do Brasil', url: 'https://pt.wikipedia.org/wiki/Unidades_federativas_do_Brasil' },
    notes: 'Vale a data da lei de criação (MS: 1977, instalado em 1979).',
    difficulty: 2,
  },
])
