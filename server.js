const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

var store = new MongoDBStore(
  {
    // server db: 
    // uri: "mongodb+srv://algostarface:Parcero2019@cluster0.stqev.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    // local db:
    uri: "mongodb://localhost:27017/algostarface?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false",
    uri: process.env.DB_HOST,
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
    //server db: 
    // "mongodb+srv://algostarface:Parcero2019@cluster0.stqev.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    //local db:
    // "mongodb://localhost:27017/algostarface?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false",
    process.env.DB_HOST,
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
