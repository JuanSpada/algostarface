const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')

const bodyParser = require('body-parser')

app.use(express.json());
const {check, validationResult} = require('express-validator') 

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/algostarface', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true, //make this also true
}).then(() => {
    console.log('Connected to mongoDB');
});

const indexRouter = require('./routes/index')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))
app.use('/', indexRouter)
app.listen(process.env.PORT || 3000)

