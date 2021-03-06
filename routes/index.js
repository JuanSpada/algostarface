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
const exportUsersToExcel = require("../src/exportService");

router.use(cookieParser());

router.get("/", async (req, res) => {
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
      let users = await User.find({ participo: true });
      let totalParticipants = Object.keys(users).length;
      res.render("index", {
        shuffle: shuffle, // si se puede participar o no
        participated: true, // pasamos si participo o no participo
        shuffleStatus: shuffleStatus, // pasamos el estado del shuffle
        walletId: req.session.walletId, // le pasamos el wallet id
        amountParticipated: totalParticipants, // pasamos la cantidad de participantes
        settings: settings,
        date: date,
        disclaimer_date: disclaimer_date,
      });
    } else {
      /////no esta abierto el shuffle
      // por ende hay que traer el usuario para ver si gano o perdi??
      const query = { walletId: req.session.walletId };
      const user = await User.findOne(query);
      res.render("index", {
        shuffle: shuffle, // si se puede participar o no
        winners: winners,
        participated: true, // pasamos si participo o no participo
        shuffleStatus: shuffleStatus, // pasamos el estado del shuffle
        walletId: req.session.walletId, // le pasamos el wallet id
        hasWon: user["winner"], // le pasamos si gano o perdi??
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
      // winner: false,
      createdAt: Date.now(),
    },
  };
  try {
    req.session.walletId = req.body.walletId;
    await User.updateOne(filter, updateDoc, options);
    res.redirect("/");
  } catch (e) {
    throw e;
  }
});

router.post("/send-tw-username", async (req, res) => {
  try {
    const query = { walletId: req.body["walletId"] };
    const update = { twitter_username: req.body["tiwtter_user"] };
    const options = { upsert: true };
    const updateTwitter = await User.updateOne(query, update, options);
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
      "N3RUU3R5MS5Q3NDDVF4Z4DF4JOFVKX5MSG6QATUVCMNVY3I5GT6VTEFRCY" ||
      req.session.walletId == 
      "4L5WJB46CST6JB26U4MEQZ5PIG2QO6EM6X5OZCSWFUHBDIMENMAIWULURQ"
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
      "N3RUU3R5MS5Q3NDDVF4Z4DF4JOFVKX5MSG6QATUVCMNVY3I5GT6VTEFRCY" ||
      req.session.walletId == 
      "4L5WJB46CST6JB26U4MEQZ5PIG2QO6EM6X5OZCSWFUHBDIMENMAIWULURQ"
  ) {
    let settings = await Settings.findOne();
    let date = req.body["shuffle_date"];
    date = moment.tz(date, "America/New_York").format("YYYY-MM-DD HH:mm");
    settings.shuffle_date = date;
    settings.shuffle_status = req.body["shuffle_status"];
    settings.show_winners = req.body["show_winners"];
    settings.nft_price = req.body["nft_price"];
    settings.reset_db = false;
    try {
      settings = await settings.save();
      res.redirect("/admin");
    } catch (e) {
      throw e;
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
      "N3RUU3R5MS5Q3NDDVF4Z4DF4JOFVKX5MSG6QATUVCMNVY3I5GT6VTEFRCY" ||
      req.session.walletId == 
      "4L5WJB46CST6JB26U4MEQZ5PIG2QO6EM6X5OZCSWFUHBDIMENMAIWULURQ"
  ) {
    try {
      let updateUsers = await User.updateMany(
        {},
        { participo: false, winner: false }
      );
      res.redirect("/");
    } catch (e) {
      print(e);
    }
  } else {
    res.redirect("/");
  }
});

router.get("/users", async (req, res) => {
  if (
    req.session.walletId ==
      "4VKJQQ3VDJ6FNTC7FDYTQWW536G7M2O53P4P6ZHUVFZ35SCOB6CSUHST74" ||
    req.session.walletId ==
      "N3RUU3R5MS5Q3NDDVF4Z4DF4JOFVKX5MSG6QATUVCMNVY3I5GT6VTEFRCY" ||
      req.session.walletId == 
      "4L5WJB46CST6JB26U4MEQZ5PIG2QO6EM6X5OZCSWFUHBDIMENMAIWULURQ"
  ) {
    let users = await User.find({ participo: true });
    let totalParticipants = Object.keys(users).length;
    res.render("users", {
      users: users,
      totalParticipants: totalParticipants,
    });
  } else {
    res.redirect("/");
  }
});

router.put("/users", async (req, res) => {
  if (
    req.session.walletId ==
      "4VKJQQ3VDJ6FNTC7FDYTQWW536G7M2O53P4P6ZHUVFZ35SCOB6CSUHST74" ||
    req.session.walletId ==
      "N3RUU3R5MS5Q3NDDVF4Z4DF4JOFVKX5MSG6QATUVCMNVY3I5GT6VTEFRCY" ||
    req.session.walletId == 
      "4L5WJB46CST6JB26U4MEQZ5PIG2QO6EM6X5OZCSWFUHBDIMENMAIWULURQ"
  ) {
    const data = req.body;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const filter = { walletId: element["walletId"] };
      const options = { upsert: false };
      const updateDoc = {
        $set: {
          winner: element["winnerStatus"],
        },
      };
      try {
        req.session.walletId = req.body.walletId;
        res = await User.updateOne(filter, updateDoc, options);
      } catch (e) {
        throw e;
      }
    }
  } else {
    res.redirect("/");
  }
});

router.post("/download-users", async (req, res) => {
  let users = await User.find({ participo: true });
  const workSheetColumnName = ["walletId", "winner", "createdAt"];
  const workSheetName = "Users";
  const filePath = "./routes/users.xlsx";
  exportUsersToExcel(users, workSheetColumnName, workSheetName, filePath);
  res.sendFile(__dirname + "/users.xlsx");
});


//auth admin

router.get("/auth-admin", async (req, res) => {
  res.render("auth-admin");
});

router.post("/auth-admin", async (req, res) => {
  console.log("Session antes: ", req.session.walletId)
  const filter = { walletId: req.body.walletId };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      walletId: req.body.walletId,
      participo: false,
      // winner: false,
      createdAt: Date.now(),
    },
  };
  try {
    req.session.walletId = req.body.walletId;
    await User.updateOne(filter, updateDoc, options);
    res.redirect("/forro");
  } catch (e) {
    throw e;
  }
  console.log("Session despu??s: ", req.session.walletId)
});

module.exports = router;
