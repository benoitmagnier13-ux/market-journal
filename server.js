const express = require('express')
const path = require('path')

const app = express()
const publicDir = path.resolve(process.cwd(), 'public')

app.use(express.static(publicDir))

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'))
})

module.exports = app
