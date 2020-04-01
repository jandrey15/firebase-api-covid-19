'use strict'
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const getRawBody = require('raw-body')
const cors = require('cors')

const app = express()

// Automatically allow cross-origin requests
app.use(cors({ origin: true }))

const serviceAccount = require('./firebase-config.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'covid-19-api-7ae3b.appspot.com'
})

const bucket = admin.storage().bucket()
const file = bucket.file('covid-19/dataFirebase.json')

app.get('/', (req, res) => {
  res.header('Content-Type', 'application/json')
  // https://stackoverflow.com/questions/53082711/read-from-firebase-google-cloud-storage-as-a-buffer-in-node-js-function
  file.get(async function(err, file, apiResponse) {
    if (err) {
      console.log('Firebase storage bucket :( -> ', err)
      return res.status(401).send({ status: '401', message: 'Algo salio mal :( file bucket storage.' })
    }
    // file.metadata` has been populated.
    // console.log(file)
    const buffer = await getRawBody(file.createReadStream())
    // console.log('This is buffer file -> ', buffer)
    const jsonData = JSON.parse(buffer)

    return res.status(200).send({ status: '200', data: jsonData })
  })
})

app.get('/test', (req, res) => {
  return res.status(200).send('This is test...')
})

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(app)
