const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

var store = new MongoDBStore(
  {
    uri: "mongodb+srv://algostarface:Parcero2019@cluster0.stqev.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    // databaseName: 'connect_mongodb_session_test',
    collection: "mySessions",
  },
  function (error) {
    console.log(error);
    // Should have gotten an error
  }
);

app.use(
  session({
    secret: "1q2w3ee3w2q1",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: false,
  })
);

// PARA USAR .ENV
require("dotenv").config();

app.use(cors());
app.use(express.json());
// const {check, validationResult} = require('express-validator')
// app.use(
//   session({
//     secret: "1q2w3ee3w2q1",
//     resave: false,
//     saveUninitialized: true,
//     // cookie: { secure: true }, // esto es para https, en local no se activa
//   })
// );

const mongoose = require("mongoose");
// CON ENV FALTA VER EN DIGITAL OCEAN COMO CAMBIARLO CON SSH EN WINDOWS
// mongoose.connect(process.env.DB_HOST, {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//     autoIndex: true, //make this also true
// }).then(() => {
//     console.log('Connected to mongoDB');
// });

mongoose
  .connect(
    "mongodb+srv://algostarface:Parcero2019@cluster0.stqev.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      autoIndex: true, //make this also true
    }
  )
  .then(() => {
    console.log("Connected to mongoDB");
  });

const indexRouter = require("./routes/index");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use("/", indexRouter);
app.listen(process.env.PORT || 3000);
