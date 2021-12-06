const express = require('express')
const router = express.Router()
const User = require('./../models/user')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const fs = require('fs')

router.use(cookieParser());

router.get('/', async (req, res) => {
    res.clearCookie("participated");
    const countUsers = await User.countDocuments();
    if ('participated' in req.cookies){
        res.render('index', {participated: 1, amountParticipated: countUsers})
    }else{
        res.render('index', {participated: 0, amountParticipated: countUsers})
    }
})
router.post('/', async (req, res) => {
    let user = new User({
        walletId: req.body.walletId,
        participo: 1,
        winner: false,
        createdAt: Date.now()
    })
    const users = await User.find({});
    try{
        res.cookie('participated', req.body.walletId, { maxAge: 3600000*2  }); //3 min, esta en miliseconds
        res.send('Cookie have been saved successfully');
        const content = req.body.walletId + "\n"
        fs.appendFile('participants.log', content, err => {
        if (err) {
            console.error(err)
            return
        }
        //done!
        })
        user = await user.save()
    } catch(e){
        console.log(e)
    }
})

module.exports = router