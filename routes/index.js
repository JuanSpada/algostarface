const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const { now } = require("mongoose");

router.use(cookieParser());

router.get("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Headers", "*");
  // console.log("Cookies: ", req.cookies);
  console.log("Sessions: ", req.session);
  // PROBAMOS SI EL SHUFFLE ESTA ABIERTO EN BASE A LA FECHA
  let date = new Date("12/17/2021 16:00:00 EST").getTime();
  if (date < new Date().getTime()) {
    shuffleStatus = false;
  } else {
    shuffleStatus = true;
  }

  let shuffle = true; // si se puede jugar al shuffle o no
  // let shuffleStatus = true; // el estado del shuffle, COMNETADO POR Q LO AGARRAMOS EN BASE A LA FECHA
  let winners = false; // esto quiere decir el estado de los ganadores, si no los tenemos o los tenemos cuando el shuffle esta closed
  // fijarse si tiene cookies

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
      });
    }
  } else {
    // SI NO PARTICIPO
    /// si no tiene cookies mandar para que se logee
    res.render("index", {
      shuffle: shuffle, // si se puede participar o no
      participated: false, // pasamos si participo o no participo
      shuffleStatus: shuffleStatus, // pasamos el estado del shuffle
    });
  }
});

router.get("/admin", async (req, res) => {
  if(req.session.walletId == "4VKJQQ3VDJ6FNTC7FDYTQWW536G7M2O53P4P6ZHUVFZ35SCOB6CSUHST74"){
    console.log('sos admin')
    res.render("admin");
  }else{
    console.log('no sos admin')
    res.redirect('/');
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

module.exports = router;
