import { useParams } from 'react-router-dom'
import { NotFound } from './NotFound.tsx'
import { Home } from './Home.tsx'

export function ArchivePlay() {
  const { id } = useParams()
  const puzzleId = Number(id)
  if (!Number.isInteger(puzzleId) || puzzleId <= 0) return <NotFound />
  return <Home archivePuzzleId={puzzleId} />
}
