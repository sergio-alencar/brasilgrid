import { defineCategories } from './types.ts'

export default defineCategories([
  {
    id: 'highest-point-over-2000m',
    family: 'geology',
    label: 'Ponto mais alto acima de 2.000 m',
    description: 'O ponto culminante (mais alto) da UF passa de 2.000 metros de altitude.',
    members: ['AM', 'BA', 'ES', 'MG', 'RJ', 'RR', 'SP'],
    source: {
      name: 'Wikipédia — Lista de unidades federativas do Brasil por altitude',
      url: 'https://pt.wikipedia.org/wiki/Lista_de_unidades_federativas_do_Brasil_por_altitude',
    },
    notes:
      'Espírito Santo e Minas Gerais compartilham o mesmo ponto culminante (Pico da Bandeira, na divisa dos dois). O próximo mais alto fora da lista é o Paraná (1.877 m), então a margem para o limiar é confortável (~210 m).',
    difficulty: 2,
  },
])
