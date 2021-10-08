const express = require('express')
const cors = require('cors')
const app = express()

const baseDir = `${__dirname}/build/`

app.use(cors())
app.use(express.static(`${baseDir}`))

app.get('*', (req,res) => res.sendFile('index.html' , { root : baseDir }))

const port = 4001
const host = '192.168.1.17'

app.listen(port, host, () => console.log(`Servidor subiu com sucesso em http://${host}:${port}`))