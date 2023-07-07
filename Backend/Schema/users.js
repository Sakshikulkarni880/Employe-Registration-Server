const mongoose = require("mongoose");

//schema format for every user
const UsersSchema = new mongoose.Schema(
  {
    fname: String,
    mname: String,
    lname: String,
    gender: String,
    email: { type: String, unique: true },
    contact: { type: String, unique: true },
    address: String,
    password: String,
  },
  {
    collection: "UserDetails",
  }
);

mongoose.model("UserDetails", UsersSchema);
