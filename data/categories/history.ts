import { defineCategories } from "./types.ts";

export default defineCategories([
  {
    id: "former-federal-territory",
    family: "history",
    label: "Já foi território federal",
    description: "A UF foi território federal antes de virar estado.",
    labelEn: "Was once a federal territory",
    descriptionEn: "The state was a federal territory before becoming a state.",
    labelEs: "Fue territorio federal",
    descriptionEs: "La UF fue territorio federal antes de convertirse en estado.",
    members: ["AC", "AP", "RO", "RR"],
    source: {
      name: "Wikipédia — Territórios federais do Brasil",
      url: "https://pt.wikipedia.org/wiki/Territ%C3%B3rios_federais_do_Brasil",
    },
    notes: "",
    difficulty: 2,
  },
  {
    id: "created-1960-or-later",
    family: "history",
    label: "UF criada a partir de 1960",
    description: "A UF passou a existir como estado em 1960 ou depois.",
    labelEn: "Created in 1960 or later",
    descriptionEn: "The state came into existence in 1960 or later.",
    labelEs: "UF creada en 1960 o después",
    descriptionEs: "La UF pasó a existir como estado en 1960 o después.",
    members: ["AC", "AP", "DF", "MS", "RO", "RR", "TO"],
    source: {
      name: "Wikipédia — Unidades federativas do Brasil",
      url: "https://pt.wikipedia.org/wiki/Unidades_federativas_do_Brasil",
    },
    notes: "Vale a data da lei de criação.",
    notesEn: "Uses the date of the law that created the state.",
    notesEs: "Se usa la fecha de la ley de creación.",
    difficulty: 2,
  },
  {
    id: "birthplace-of-president",
    family: "history",
    label: "Berço de presidente da República",
    description: "A UF é o estado natal de pelo menos um presidente da República que tomou posse de fato.",
    labelEn: "Birthplace of a president",
    descriptionEn: "The state is the birthplace of at least one president of Brazil who actually took office.",
    labelEs: "Cuna de presidente",
    descriptionEs: "La UF es el estado natal de al menos un presidente de Brasil que tomó posesión de hecho.",
    members: ["AL", "BA", "CE", "MA", "MG", "MS", "MT", "PB", "PE", "RJ", "RN", "RS", "SC", "SP"],
    source: {
      name: "Wikipédia — Lista de presidentes do Brasil por nascimento",
      url: "https://pt.wikipedia.org/wiki/Lista_de_presidentes_do_Brasil_por_nascimento",
    },
    notes:
      "Só conta quem de fato tomou posse (fica de fora Júlio Prestes, Tancredo Neves e Pedro Aleixo, que nunca assumiram, e as juntas governativas de 1930 e 1969, que não são presidentes individuais). Itamar Franco: o registro oficial diz Bahia, embora haja uma hipótese de Minas Gerais (certidão de batismo); usamos o registro oficial. Jânio Quadros nasceu em Campo Grande quando ainda era Mato Grosso (antes da divisão de 1977); contamos pelo estado atual (MS).",
    notesEn:
      "Only counts presidents who actually took office (leaving out Júlio Prestes, Tancredo Neves, and Pedro Aleixo, who never did, and the 1930 and 1969 governing juntas, which aren't individual presidents). Itamar Franco: the official record says Bahia, though there's a hypothesis for Minas Gerais (baptism certificate); we use the official record. Jânio Quadros was born in Campo Grande back when it was still Mato Grosso (before the 1977 split); we count him under the current state (MS).",
    notesEs:
      "Solo cuenta quienes efectivamente tomaron posesión (quedan fuera Júlio Prestes, Tancredo Neves y Pedro Aleixo, que nunca asumieron, y las juntas de gobierno de 1930 y 1969, que no son presidentes individuales). Itamar Franco: el registro oficial dice Bahia, aunque existe una hipótesis de Minas Gerais (acta de bautismo); usamos el registro oficial. Jânio Quadros nació en Campo Grande cuando todavía era Mato Grosso (antes de la división de 1977); lo contamos en el estado actual (MS).",
    difficulty: 2,
  },
  {
    id: "had-woman-governor",
    family: "history",
    label: "Já teve governadora mulher",
    description: "A UF já teve uma mulher como governadora, eleita ou que assumiu o cargo.",
    labelEn: "Has had a woman governor",
    descriptionEn: "The state has had a woman as governor, either elected or who assumed the office.",
    labelEs: "Ya tuvo gobernadora mujer",
    descriptionEs: "La UF ya tuvo una mujer como gobernadora, elegida o que asumió el cargo.",
    members: ["AC", "AP", "CE", "DF", "MA", "PA", "PE", "PI", "PR", "RJ", "RN", "RR", "RS"],
    source: {
      name: "Wikipédia — Lista de governadoras das unidades federativas do Brasil",
      url: "https://pt.wikipedia.org/wiki/Lista_de_governadoras_das_unidades_federativas_do_Brasil",
    },
    notes:
      'A própria página resume: "apenas 12 estados + Distrito Federal" já tiveram governadora mulher — bate com os 13 membros aqui. Conta tanto quem venceu eleição quanto vice-governadora que assumiu o cargo (não vice que nunca assumiu). Rondônia fica de fora de propósito: aparece só num artigo avulso e malsourceado sobre uma governadora interina de 1984, que nem está na lista consolidada e se contradiz sobre ser "a primeira" ou "a segunda" mulher no cargo no Brasil.',
    notesEn:
      'The page itself sums it up: "only 12 states + the Federal District" have had a woman governor — matches the 13 members here (12 states plus DF). Counts both elected governors and vice-governors who assumed the office (not vices who never did). Rondônia is deliberately left out: it only shows up in a standalone, poorly sourced article about a 1984 interim governor, who isn\'t even in the consolidated list and whose own article contradicts itself on whether she was "the first" or "the second" woman to hold the office in Brazil.',
    notesEs:
      'La propia página resume: "solo 12 estados + el Distrito Federal" han tenido gobernadora mujer — coincide con los 13 miembros aquí (12 estados más el DF). Cuenta tanto a quienes ganaron la elección como a las vicegobernadadoras que asumieron el cargo (no las que nunca asumieron). Rondônia queda fuera de manera deliberada: solo aparece en un artículo aislado y mal documentado sobre una gobernadora interina de 1984, que ni siquiera está en la lista consolidada y cuyo propio artículo se contradice sobre si fue "la primera" o "la segunda" mujer en el cargo en Brasil.',
    difficulty: 2,
  },
]);
