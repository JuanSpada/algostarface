const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema({
    shuffle_date: {
        type: String,
        required: true,
    },
    shuffle_status: {
        type: Boolean,
        required: true,
    },
    show_winners: {
        type: Boolean,
        required: true,
    },
    nft_price: {
        type: Number,
        required: true,
    },
    reset_db: {
        type: Boolean,
        required: true,
    }
})

module.exports = mongoose.model('Settings', settingsSchema)