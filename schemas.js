const { Schema, model } = require("mongoose");

var ItemSchema = new Schema({
    _id: String,
    name: String,
    price: Number,
    quantity: Number
});

var ShopSchema = new Schema({
    _id: String,
    items: [ItemSchema]
});

const shop = new model("shop", ShopSchema);

module.exports = { shop };
