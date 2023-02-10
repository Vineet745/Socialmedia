const mongoose = require('mongoose')
const plm = require("passport-local-mongoose")
const usermodel = new mongoose.Schema({
    name: String,
    username:String,
    about:String,
    email:String,
    password:String,
    home:[{type:mongoose.Schema.Types.ObjectId, ref:"post"}], 
    avatar:{
        type:String,
        default:"dummy.png"
    },
    resetPasswordToken: 0,
})

usermodel.plugin(plm,{usernameField: "email"});

const User = new mongoose.model('user',usermodel)
module.exports = User;