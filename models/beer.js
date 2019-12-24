// MONGOOSE/MODEL CONFIG
const mongoose = require("mongoose");

let beerSchema = new mongoose.Schema({
    title: String,
    image: String, // {type: String, default: "placeholderimage.jpg"}
    realPrice: Number,
    currentPrice: Number
});

module.exports = mongoose.model("Beer", beerSchema);
