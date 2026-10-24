import { defineCategories } from './types.ts'

export default defineCategories([
  {
    id: 'highest-point-over-2000m',
    family: 'geology',
    label: 'Ponto mais alto acima de 2.000 m',
    description: 'O ponto culminante (mais alto) da UF passa de 2.000 metros de altitude.',
    labelEn: 'Highest point above 2,000 m',
    descriptionEn: "The state's highest point is above 2,000 meters in elevation.",
    labelEs: 'Punto más alto sobre 2.000 m',
    descriptionEs: 'El punto culminante (más alto) de la UF supera los 2.000 metros de altitud.',
    members: ['AM', 'BA', 'ES', 'MG', 'RJ', 'RR', 'SP'],
    source: {
      name: 'Wikipédia — Lista de unidades federativas do Brasil por altitude',
      url: 'https://pt.wikipedia.org/wiki/Lista_de_unidades_federativas_do_Brasil_por_altitude',
    },
    notes:
      'Espírito Santo e Minas Gerais compartilham o mesmo ponto culminante (Pico da Bandeira, na divisa dos dois). O próximo mais alto fora da lista é o Paraná (1.877 m), então a margem para o limiar é confortável (~210 m).',
    notesEn:
      "Espírito Santo and Minas Gerais share the same highest point (Pico da Bandeira, right on their border). The next-highest point left out is Paraná (1,877 m), so there's a comfortable margin (~210 m) to the cutoff.",
    notesEs:
      'Espírito Santo y Minas Gerais comparten el mismo punto culminante (Pico da Bandeira, en la frontera entre ambos). El siguiente más alto fuera de la lista es Paraná (1.877 m), por lo que el margen al umbral es cómodo (~210 m).',
    difficulty: 2,
  },
])
