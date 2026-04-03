import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

function detectPackageManager(cwd: string): PackageManager {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm'
  if (fs.existsSync(path.join(cwd, 'bun.lockb'))) return 'bun'
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn'
  return 'npm'
}

function installDependencies(cwd: string): void {
  const pm = detectPackageManager(cwd)
  const packages = 'remix-forms@latest tailwind-merge@latest'

  const commands: Record<PackageManager, string> = {
    pnpm: `pnpm add ${packages}`,
    npm: `npm install ${packages}`,
    yarn: `yarn add ${packages}`,
    bun: `bun add ${packages}`,
  }

  execSync(commands[pm], { cwd, stdio: 'pipe' })
}

export { detectPackageManager, installDependencies }
