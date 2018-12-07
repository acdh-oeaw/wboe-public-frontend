if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config({
    path : './env-dev.env'
  })
}

const express = require('express')
const cookieSession = require('cookie-session')
const compression = require('compression')
const path = require('path')
const app = express()
const proxy = require('express-http-proxy')
const fs = require('fs')
const bodyParser = require('body-parser')
const axios = require('axios')

var cors = require('cors')

// This app runs behind an
// application load balancer
// which handles the Certificate
// Negotiation for us, so we must
// trust them if they say it’s https.
app.enable('trust proxy')


app.use(cors())

// redirect to https if it’s a
// http call.
app.use((request, response, next) => {
  const host = request.headers.host
  const protocol = request.protocol
  if (process.env.NODE_ENV === 'production' && protocol === 'http') {
    response.redirect(301, 'https://' + host + request.url)
  } else {
    next()
  }
})

app.use(compression())
app.use(bodyParser.json())
app.get('/api/article', async (req, res) => {
  const r = (await axios({
    url: 'https://wboe-curation.acdh-dev.oeaw.ac.at/exist/restxq/wboe-api/v0.1/article?max=150&lemma='+ req.query.initial +'&status=proofed',
    headers: {
      Accept: 'application/json'
    }
  })).data
  res.send(r)
})
app.get('/api/article/:article', async (req, res) => {
  console.log(req.params.article)
  const r = (await axios({
    url: 'https://wboe-curation.acdh-dev.oeaw.ac.at/exist/restxq/wboe-api/v0.1/article/'+ encodeURIComponent(req.params.article),
    headers: {
      Accept: 'application/xml'
    }
  })).data
  res.send(r)
})

app.post('/es-query', async (req, res) => {
  const q = req.body
  const r = (await axios({
    method: 'GET',
    data: q,
    url: 'https://walk-want-grew.acdh.oeaw.ac.at/_search'
  })).data
  res.send(r)
})

// app.get('/articles', (req, res) => {
//   const files = fs.readdirSync(path.join(__dirname, '../dist/static/article'))
//   const articles = files.map((name) => {
//     return {
//       file_name: name,
//       title: fs.readFileSync(path.join(__dirname, '../dist/static/article', name), 'utf8')
//         .match(/(<title>)(.*)(?=<\/title>)/g)[0].replace('<title>', '')
//       }
//   })
//   res.send(articles)
// })

app.use('/', express.static(path.join(__dirname, '../dist/')))
app.use('*', express.static(path.join(__dirname, '../dist/index.html')))
app.listen(process.env.NODE_PORT || 3333, () => {
  console.log(`Started server on port ${process.env.NODE_PORT}`)
})
