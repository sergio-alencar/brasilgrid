import { readFileSync } from 'node:fs'
import type { UfRecord } from '../../data/categories/ufData.ts'
import { dataPath } from './io.ts'

export function loadUfs(): UfRecord[] {
  return (JSON.parse(readFileSync(dataPath('ufs.json'), 'utf8')) as { ufs: UfRecord[] }).ufs
}
