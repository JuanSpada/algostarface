const express = require('express')
const router = express.Router()
const User = require('./../models/user')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const fs = require('fs')


router.use(cookieParser());
// VARIABLE DE SHOW WINNERS PARA ACTIVAR ESO
const showWinners = true;

router.get('/', async (req, res) => {
    // res.clearCookie("participated");
    res.setHeader('Access-Control-Allow-Headers', '*');

    console.log(req.cookies)
    const countUsers = await User.countDocuments();

    const query = {walletId: req.cookies.participated}
    const user = await User.findOne(query);


    //si participaste
    if('participated' in req.cookies){
        // si hay user quiere decir que participaste y ganaste
        if(user){
            if ('participated' in req.cookies && user['winner']){
                console.log('participo y es winner')
                res.render('index', {participated: 1, amountParticipated: countUsers, winner: true, showWinners, walletId: req.cookies.participated})
            }
            else{
                console.log('participo y no es winner')
                res.render('index', {participated: 0, amountParticipated: countUsers, winner: false, showWinners, walletId: req.cookies.participated})
            }
        }
    }else{
        //si no participaste
        res.render('index', {participated: 3, amountParticipated: countUsers, winner: false, showWinners, walletId: req.cookies.participated})
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
        // res.cookie('participated', req.body.walletId, { maxAge: 60*60*24*7  }); //3 min, esta en miliseconds
        res.cookie('participated' , req.body.walletId, {expire : new Date() + 9999});
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