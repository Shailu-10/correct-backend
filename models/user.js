const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  /*
    password: {
        type: String,
        required:true
    },
    
    */
  friends: [String],
});
module.exports = mongoose.model("User", userSchema); //userScheema upar ka object h
