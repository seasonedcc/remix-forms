const fs = require('node:fs/promises')
const path = require('node:path')

async function sync() {
  const root = path.resolve(__dirname, '..')
  const src = path.join(root, 'AGENTS.md')
  const dest = path.join(root, '.github', 'copilot-instructions.md')
  const dest2 = path.join(root, '.cursor', 'rules', 'repo-rules.mdc')
  const dest3 = path.join(root, 'GEMINI.md')
  const dest4 = path.join(root, 'CLAUDE.md')
  await fs.mkdir(path.dirname(dest), { recursive: true })
  await fs.mkdir(path.dirname(dest2), { recursive: true })
  const data = await fs.readFile(src)
  await fs.writeFile(dest, data)
  await fs.writeFile(dest3, data)
  await fs.writeFile(dest4, data)
  await fs.writeFile(
    dest2,
    `---
description: Agent rules for this repository, copied from AGENTS.md
globs:
alwaysApply: true
---
${data}`
  )
}

sync().catch((err) => {
  console.error(err)
  process.exit(1)
})
