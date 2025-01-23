## 설치

npm init
npm install express --save
npm install ejs
// npm install bootstrap@5.3.3
npm install body-parser
npm install mysql
npm install dotenv
npm install cors
npm install axios
// npm install -D tailwindcss
npm install express-session

## app.js 생성

const express = require('express')
const app = express()
const port = 4000

app.get('/', (req, res) => {
res.send('Hello World!')
})

app.listen(port, () => {
console.log(`Example app listening on port ${port}`)
})

## 실행

node app.js
