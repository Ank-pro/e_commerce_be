const mongoose = require("mongoose");

let ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  imageUrl : {
    type : String,
  },
  price: {
    type: Number,
    required: true,
  },
  
}, {
    timestamps: true, 
    autoIndex: true, 
});

module.exports = mongoose.model('product', ProductSchema);
