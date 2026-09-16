import { IBGE_LOCALIDADES, normalize } from './common.ts'
import { defineCategories } from './types.ts'

// Só categorias que exigem saber algo além do nome exibido na busca (a sigla não aparece).
export default defineCategories([
  {
    id: 'code-is-first-two-letters',
    family: 'names',
    label: 'Sigla = duas primeiras letras',
    description: 'A sigla da UF são as duas primeiras letras do nome (ex.: GO, Goiás).',
    members: ['AC', 'AL', 'AM', 'BA', 'CE', 'ES', 'GO', 'MA', 'PA', 'PE', 'PI', 'RO', 'SE', 'TO'],
    source: IBGE_LOCALIDADES,
    difficulty: 2,
    derive: (uf) => normalize(uf.name).slice(0, 2).toUpperCase() === uf.code,
  },
])
