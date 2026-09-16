import borders from './borders.ts'
import capitals from './capitals.ts'
import coast from './coast.ts'
import demography from './demography.ts'
import history from './history.ts'
import hydrography from './hydrography.ts'
import names from './names.ts'
import politics from './politics.ts'
import regions from './regions.ts'
import sports from './sports.ts'
import type { CategoryDef } from './types.ts'

export const CATEGORIES: CategoryDef[] = [
  ...regions,
  ...borders,
  ...coast,
  ...hydrography,
  ...politics,
  ...capitals,
  ...names,
  ...demography,
  ...history,
  ...sports,
]
