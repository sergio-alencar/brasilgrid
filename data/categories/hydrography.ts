import { defineCategories } from './types.ts'

const wiki = (page: string, title: string) => ({
  name: `Wikipédia — ${title}`,
  url: `https://pt.wikipedia.org/wiki/${page}`,
})

export default defineCategories([
  {
    id: 'river-sao-francisco',
    family: 'hydrography',
    label: 'Banhado pelo São Francisco',
    description: 'O Rio São Francisco atravessa a UF ou forma parte de sua divisa.',
    members: ['AL', 'BA', 'MG', 'PE', 'SE'],
    source: wiki('Rio_S%C3%A3o_Francisco', 'Rio São Francisco'),
    notes: 'Conta o curso do rio, não a bacia (a bacia também inclui GO e DF).',
    difficulty: 2,
  },
  {
    id: 'river-tocantins',
    family: 'hydrography',
    label: 'Banhado pelo Rio Tocantins',
    description: 'O Rio Tocantins atravessa a UF ou forma parte de sua divisa.',
    members: ['GO', 'MA', 'PA', 'TO'],
    source: wiki('Rio_Tocantins', 'Rio Tocantins'),
    notes: 'No Maranhão, o rio forma a divisa com o Tocantins.',
    difficulty: 2,
  },
  {
    id: 'river-araguaia',
    family: 'hydrography',
    label: 'Banhado pelo Rio Araguaia',
    description: 'O Rio Araguaia atravessa a UF ou forma parte de sua divisa.',
    members: ['GO', 'MT', 'PA', 'TO'],
    source: wiki('Rio_Araguaia', 'Rio Araguaia'),
    notes: 'O Araguaia forma as divisas GO–MT, MT–TO e TO–PA.',
    difficulty: 2,
  },
  {
    id: 'river-parana',
    family: 'hydrography',
    label: 'Banhado pelo Rio Paraná',
    description: 'O Rio Paraná atravessa a UF ou forma parte de sua divisa.',
    members: ['MS', 'PR', 'SP'],
    source: wiki('Rio_Paran%C3%A1', 'Rio Paraná'),
    notes: 'O rio nasce na tríplice divisa MG–SP–MS (encontro dos rios Grande e Paranaíba); MG não conta.',
    difficulty: 2,
  },
  {
    id: 'river-paraiba-do-sul',
    family: 'hydrography',
    label: 'Banhado pelo Paraíba do Sul',
    description: 'O Rio Paraíba do Sul atravessa a UF ou forma parte de sua divisa.',
    members: ['MG', 'RJ', 'SP'],
    source: wiki('Rio_Para%C3%ADba_do_Sul', 'Rio Paraíba do Sul'),
    notes: 'Em Minas Gerais, o rio forma um trecho da divisa com o Rio de Janeiro.',
    difficulty: 3,
  },
])
