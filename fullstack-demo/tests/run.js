// tests/run.js
// Entry point: node tests/run.js
// Requires API running on port 3001 — start it first:
//   cd src/api && npm install && node server.js

import { run } from './api.test.js'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

function buildReport(summary) {
  const { passed, failed, results } = summary
  const total = passed + failed
  const date  = new Date().toISOString().slice(0, 10)

  const rows = results.map(r => {
    const status = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'
    const note   = r.status === 'PASS' ? 'As expected' : r.error
    return `| ${r.name} | ${status} | ${note} |`
  }).join('\n')

  return `# Test Report — Fullstack Demo
Generated: ${date} (live run)

## Summary
| Metric | Value |
|--------|-------|
| Total Tests | ${total} |
| Passed | ${passed} |
| Failed | ${failed} |
| Pass Rate | ${Math.round((passed / total) * 100)}% |
| Coverage | Users CRUD ✅, Posts CRUD ✅, Validation ✅, Filtering ✅ |

## Test Results

| Test | Status | Notes |
|------|--------|-------|
${rows}

## How to Run
\`\`\`bash
# Terminal 1 — Start API
cd c:/Soutenance/Gestion-de-budget/fullstack-demo/src/api
npm install && node server.js

# Terminal 2 — Run tests
cd c:/Soutenance/Gestion-de-budget/fullstack-demo
node tests/run.js
\`\`\`

Node.js 18+ required (built-in fetch used).
`
}

run()
  .then(summary => {
    const report     = buildReport(summary)
    const reportPath = join(__dirname, 'report.md')
    writeFileSync(reportPath, report, 'utf8')
    console.log(`\n📄 Report written to tests/report.md`)
    process.exit(summary.failed > 0 ? 1 : 0)
  })
  .catch(err => {
    console.error('\n💥 Could not connect to API:', err.message)
    console.error('Make sure the API is running on port 3001 first.')
    process.exit(1)
  })
