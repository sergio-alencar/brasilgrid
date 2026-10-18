import { IBGE_LOCALIDADES, normalize } from "./common.ts";
import { defineCategories } from "./types.ts";

// Só categorias que exigem saber algo além do nome exibido na busca (a sigla não aparece).
export default defineCategories([
  {
    id: "code-is-first-two-letters",
    family: "names",
    label: "Sigla = duas primeiras letras",
    description: "A sigla da UF são as duas primeiras letras do nome.",
    members: ["AC", "AL", "AM", "BA", "CE", "ES", "GO", "MA", "PA", "PE", "PI", "RO", "SE", "TO"],
    source: IBGE_LOCALIDADES,
    difficulty: 2,
    derive: (uf) => normalize(uf.name).slice(0, 2).toUpperCase() === uf.code,
  },
  {
    id: "name-tupi-origin",
    family: "names",
    label: "Nome de origem Tupi",
    description: "O nome da UF vem do Tupi (ou Tupi antigo), sem outra hipótese concorrente.",
    members: ["PA", "PB", "PR", "PE", "PI", "SE", "TO"],
    source: {
      name: "Wikipédia — Etimologia das unidades federativas do Brasil",
      url: "https://pt.wikipedia.org/wiki/Etimologia_das_unidades_federativas_do_Brasil",
    },
    notes:
      "Só entram os nomes que a página atribui ao Tupi sem ressalva. Ficam de fora Ceará, Maranhão e Amapá, que a própria página chama de incertos/disputados (mais de uma hipótese, nenhuma preferida) — não por serem de outra origem, mas por serem duvidosos demais pra um gabarito.",
    difficulty: 3,
  },
]);
