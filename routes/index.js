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
  // console.log("Cookies: ", req.cookies);
  // console.log("Sessions: ", req.session);
  // PROBAMOS SI EL SHUFFLE ESTA ABIERTO EN BASE A LA FECHA
  let settings = await Settings.findOne();
  const shuffle = settings.shuffle_status;
  const winners = settings.show_winners;
  let date = settings.shuffle_date;
  console.log("Shuffle Date on db: ", settings.shuffle_date);
  let disclaimer_date = hdate.prettyPrint(date, { showTime: true });
  if (date < new Date().getTime()) {
    shuffleStatus = false;
  } else {
    shuffleStatus = true;
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
  let user = new User({
    walletId: req.body.walletId,
    participo: 1,
    winner: false,
    createdAt: Date.now(),
  });
  const users = await User.find({});
  req.session.walletId = req.body.walletId;
  try {
    // res.cookie('participated', req.body.walletId, { maxAge: 60*60*24*7  }); //3 min, esta en miliseconds
    // res.cookie("participated2", req.body.walletId, {
    //   expire: new Date() + 9999,
    // });
    res.send("Cookie have been saved successfully");
    const content = req.body.walletId + "\n";
    fs.appendFile("participants.log", content, (err) => {
      if (err) {
        console.error(err);
        return;
      }
      //done!
    });
    user = await user.save();
  } catch (e) {
    console.log(e);
  }
});

//admin
router.get("/admin", async (req, res) => {
  let settings = await Settings.findOne();
  console.log(settings.shuffle_date);
  let dateString = settings.shuffle_date.split(" ");
  console.log("dateString", dateString);
  let date = dateString[0] + "T" + dateString[1] 
  console.log(settings);
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
  try {
    settings = await settings.save();
    res.redirect("/admin");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
