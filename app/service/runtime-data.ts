import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

export const ensureRuntimeDataDir = (appRootPath: string): string => {
  const dataDir = join(appRootPath, 'data')
  mkdirSync(dataDir, { recursive: true })
  return dataDir
}
