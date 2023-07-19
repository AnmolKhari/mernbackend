const mongoose=require("mongoose");
const bcrypt =require("bcryptjs");
const jwt=require("jsonwebtoken");

// Schema for shopRegistration database
const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  gender: String,
  status: String
  
});

const Shop = new mongoose.model("Shop", shopSchema);
module.exports = Shop;
