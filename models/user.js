const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    walletId: {
        type: String,
        required: true,
        // unique: true,
    },
    participo: {
        type: Boolean,
    },
    winner: {
        type: Boolean,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema)