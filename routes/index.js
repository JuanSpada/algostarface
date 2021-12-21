const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const Settings = require("./../models/settings");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const { now } = require("mongoose");
const moment = require("moment-timezone");
const hdate = require("human-date");

router.use(cookieParser());

// const shuffle = true; // si se puede jugar al shuffle o no
// // const shuffleStatus = true; // el estado del shuffle, COMNETADO POR Q LO AGARRAMOS EN BASE A LA FECHA
// const winners = false; // esto quiere decir el estado de los ganadores, si no los tenemos o los tenemos cuando el shuffle esta closed
// fijarse si tiene cookies

router.get("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "*");
  let settings = await Settings.findOne();
  const shuffle = settings.shuffle_status;
  const winners = settings.show_winners;
  let date = settings.shuffle_date;
  console.log("esta date: ", date);
  let disclaimer_date = hdate.prettyPrint(date, { showTime: true });




  let dbDate = date;
  console.log("Db Date: ", dbDate)
  dbDate = moment(dbDate).format();
  console.log("Db Date Formatted: ", dbDate)
  let nowDate = moment().tz("America/New_York").format();
  console.log("Now Date: ",nowDate)

  dbDate = new Date(date + " EST").getTime();
  nowDate = new Date().getTime();

  if (dbDate < nowDate) {
    shuffleStatus = false;
  } else {
    shuffleStatus = true;
  }

  //SI NO PARTICIPO RESETEAMOS COOKIES PARA Q VUELVA A PARTICIPAR, ESTO ES PARA RESETEAR LOS SHUFFLE
  let user = await User.findOne({ walletId: req.session.walletId });

  if (user) {
    if (!user.participo) {
      // si el user no participo le renderizamos para que participe de nuevo
      console.log(user);
      res.clearCookie("connect.sid");
      res.render("index", {
        shuffle: shuffle, // si se puede participar o no
        participated: false, // pasamos si participo o no participo
        shuffleStatus: shuffleStatus, // pasamos el estado del shuffle
        settings: settings,
        date: date,
        disclaimer_date: disclaimer_date,
      });
    }
  }

  if (req.session.walletId) {
    if (shuffleStatus) {
      ///// esta abierto el shuffle
      const countUsers = await User.countDocuments();
      res.render("index", {
        shuffle: shuffle, // si se puede participar o no
        participated: true, // pasamos si participo o no participo
        shuffleStatus: shuffleStatus, // pasamos el estado del shuffle
        walletId: req.cookies.participated2, // le pasamos el wallet id
        amountParticipated: countUsers, // pasamos la cantidad de participantes
        settings: settings,
        date: date,
        disclaimer_date: disclaimer_date,
      });
    } else {
      /////no esta abierto el shuffle
      // por ende hay que traer el usuario para ver si gano o perdió
      const query = { walletId: req.session.walletId };
      const user = await User.findOne(query);
      console.log("Is winner: ", user["winner"]);
      res.render("index", {
        shuffle: shuffle, // si se puede participar o no
        winners: winners,
        participated: true, // pasamos si participo o no participo
        shuffleStatus: shuffleStatus, // pasamos el estado del shuffle
        walletId: req.cookies.participated2, // le pasamos el wallet id
        hasWon: user["winner"], // le pasamos si gano o perdió
        settings: settings,
        date: date,
        disclaimer_date: disclaimer_date,
      });
    }
  } else {
    // SI NO PARTICIPO
    /// si no tiene cookies mandar para que se logee
    res.render("index", {
      shuffle: shuffle, // si se puede participar o no
      participated: false, // pasamos si participo o no participo
      shuffleStatus: shuffleStatus, // pasamos el estado del shuffle
      settings: settings,
      date: date,
      disclaimer_date: disclaimer_date,
    });
  }
});

router.post("/", async (req, res) => {
  //validamos si el user ya existe

  // let user = await User.findOne({ walletId: req.session.walletId })
  // console.log("Wallet Id: ",req.session.walletId)
  // //si no existe el user lo creamos.
  // let newUser = new User({
  //   walletId: req.body.walletId,
  //   participo: 1,
  //   winner: false,
  //   createdAt: Date.now(),
  // });
  // const users = await User.find({});
  // req.session.walletId = req.body.walletId;
  // // Mandamos los participantes a un log por las dudas
  // try {
  //   res.send("Cookie have been saved successfully");
  //   const content = "Wallet Id: " + req.body.walletId + "Created At: " + Date.now() + "\n";
  //   fs.appendFile("participants.log", content, (err) => {
  //     if (err) {
  //       console.error(err);
  //       return;
  //     }
  //   });
  //   newUser = await newUser.save();
  // } catch (e) {
  //   console.log(e);
  // }

  //si existe el valor lo actualizamos sino lo creamos.
  const filter = { walletId: req.body.walletId };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      walletId: req.body.walletId,
      participo: true,
      winner: false,
      createdAt: Date.now(),
    },
  };
  try {
    req.session.walletId = req.body.walletId;
    await User.updateOne(filter, updateDoc, options);
    res.redirect("/");
  } catch (e) {
    console.log(e);
  }
});

//admin
router.get("/admin", async (req, res) => {
  let settings = await Settings.findOne();
  let dateString = settings.shuffle_date.split(" ");
  let date = dateString[0] + "T" + dateString[1];
  if (
    req.session.walletId ==
      "4VKJQQ3VDJ6FNTC7FDYTQWW536G7M2O53P4P6ZHUVFZ35SCOB6CSUHST74" ||
    req.session.walletId ==
      "N3RUU3R5MS5Q3NDDVF4Z4DF4JOFVKX5MSG6QATUVCMNVY3I5GT6VTEFRCY"
  ) {
    res.render("admin", {
      settings: settings,
      shuffle_date: date,
    });
  } else {
    res.redirect("/");
  }
});

router.post("/admin", async (req, res) => {
  let settings = await Settings.findOne();
  let date = req.body.shuffle_date;
  date = moment.tz(date, "America/New_York").format("YYYY-MM-DD HH:mm");
  console.log("NY DATE: ", date);
  settings.shuffle_date = date;
  settings.shuffle_status = req.body.shuffle_status;
  settings.show_winners = req.body.show_winners;
  settings.nft_price = req.body.nft_price;
  settings.reset_db = false;
  try {
    settings = await settings.save();
    res.redirect("/admin");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
