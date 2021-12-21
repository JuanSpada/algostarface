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

router.get("/", async (req, res) => {
  console.log(req.session)
  res.setHeader("Access-Control-Allow-Headers", "*");
  let settings = await Settings.findOne();
  const shuffle = settings.shuffle_status;
  const winners = settings.show_winners;
  let date = settings.shuffle_date;
  let disclaimer_date = hdate.prettyPrint(date, { showTime: true });
  let dbDate = date;
  dbDate = moment(dbDate).format();
  let nowDate = moment().tz("America/New_York").format();
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
        walletId: req.session.walletId, // le pasamos el wallet id
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
        walletId: req.session.walletId, // le pasamos el wallet id
        hasWon: user["winner"], // le pasamos si gano o perdió
        twitter_username: user.twitter_username,
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

router.post("/send-tw-username", async (req, res) => {
  console.log(req.body);
  try {
    const query = { walletId: req.body["walletId"] };
    const update = { twitter_username: req.body["tiwtter_user"] };
    const options = { upsert: true };
    const updateTwitter = await User.updateOne(query, update, options);
    console.log(updateTwitter);
    console.log('session: ', req.session)
  } catch (e) {
    print(e);
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
  if (
    req.session.walletId ==
      "4VKJQQ3VDJ6FNTC7FDYTQWW536G7M2O53P4P6ZHUVFZ35SCOB6CSUHST74" ||
    req.session.walletId ==
      "N3RUU3R5MS5Q3NDDVF4Z4DF4JOFVKX5MSG6QATUVCMNVY3I5GT6VTEFRCY"
  ) {
    let settings = await Settings.findOne();
    let date = req.body["shuffle_date"];
    date = moment.tz(date, "America/New_York").format("YYYY-MM-DD HH:mm");
    console.log("NY DATE: ", date);
    settings.shuffle_date = date;
    settings.shuffle_status = req.body["shuffle_status"];
    settings.show_winners = req.body["show_winners"];
    settings.nft_price = req.body["nft_price"];
    settings.reset_db = false;
    try {
      settings = await settings.save();
      res.redirect("/admin");
    } catch (e) {
      console.log(e);
    }
  } else {
    res.redirect("/");
  }
});

router.get("/reset-shuffle", async (req, res) => {
  if (
    req.session.walletId ==
      "4VKJQQ3VDJ6FNTC7FDYTQWW536G7M2O53P4P6ZHUVFZ35SCOB6CSUHST74" ||
    req.session.walletId ==
      "N3RUU3R5MS5Q3NDDVF4Z4DF4JOFVKX5MSG6QATUVCMNVY3I5GT6VTEFRCY"
  ) {
    try {
      let updateUsers = await User.updateMany(
        {},
        { participo: false, winner: false }
      );
      console.log("Reset Shuffle Completed: ", updateUsers);
      res.redirect("/");
    } catch (e) {
      print(e);
    }
  } else {
    res.redirect("/");
  }
});

module.exports = router;
