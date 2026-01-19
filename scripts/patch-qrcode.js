// Script pour créer un mock de qrcode/lib/server.js sur le web
const fs = require('fs')
const path = require('path')

const serverPath = path.join(__dirname, '../node_modules/qrcode/lib/server.js')

// Créer le répertoire s'il n'existe pas
const libDir = path.dirname(serverPath)
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true })
}

// Créer le fichier mock
const mockContent = `// Mock pour qrcode/lib/server sur React Native Web
module.exports = {
  create: () => ({ modules: [], version: 0 }),
  toDataURL: () => Promise.resolve('data:image/png;base64,'),
  toString: () => '',
}
`

fs.writeFileSync(serverPath, mockContent)
console.log('Mock qrcode/lib/server.js créé')
