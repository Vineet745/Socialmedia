const mongoose = require('mongoose')
const postmodel = new mongoose.Schema({
    author:[{type:mongoose.Schema.Types.ObjectId,ref:"user"}],
    createdAt:{
        type:String,
        default:Date.now
    },
    image:String,
    location:String,
    comment:String,
})

const Post = new mongoose.model('post',postmodel)
module.exports = Post;