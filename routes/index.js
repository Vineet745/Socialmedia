var express = require('express');
var router = express.Router();

const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')
const upload = require('./multer')
const passport = require('passport')
const User = require('../model/usermodel')
const Post = require('../model/post')
const localstr = require('passport-local')

passport.use(User.createStrategy());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

router.post('/login', passport.authenticate('local',{
    successRedirect:'/home',
    failureRedirect:"/"
}), function(req, res, next) {
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Express' });
});

router.post('/register', function(req, res, next) {
  const {username,name,email,password,about} = req.body
  const registeruser = {username,name,email,about}
  User.register(registeruser,password)
  .then(()=> res.redirect('/'))
  .catch((err)=> res.send(err))
});

router.get('/home', IsloggedIn, function(req, res, next) {
  User.findById(req.user._id)
  .populate("home")
  .then((user)=>{
    res.render('home',{title: "User Blog", user:req.user, home:user.home,
  });
  })
  .catch((err)=> res.send(err)); 
});

// Deleting the post

router.get('/delete/:id', IsloggedIn, function(req, res, next) {
  Post.findByIdAndDelete(req.params.id)
  .then((deleteddata)=>{
    fs.unlinkSync(
      path.join(__dirname,"..","public","uploads",deleteddata.image)
    )
    res.redirect('/home');
  })
  .catch((err)=> res.send(err))
});


// Signout

router.get('/logout', IsloggedIn, function(req, res, next) {
  req.logout(function(){
    res.redirect('/')
  })
});

router.get('/forgetpassword', function(req, res, next) {
  res.render('forgetpassword')
});

router.post('/forgetpassword', function(req, res, next) {
  User.findOne({email:req.body.email})
  .then((user)=>{
    if(!user)
    return res.send("Email not valid <a href='/forgetpassword'>Try Again</a>");

    const pageurl =
                req.protocol +
                "://" +
                req.get("host") +
                "/change-password/" +
                user._id;

                const transport = nodemailer.createTransport({
                  service: "gmail",
                  host: "smtp.gmail.com",
                  port: 465,
                  auth: {
                      user: "vineetagrawal745@gmail.com",
                      pass: "pyoqglardbwrmhaf",
                  },
              });
              const mailOptions = {
                from: "Instagram.co.in.<dhanesh1296@gmail.com>",
                to: req.body.email,
                subject: "Password Reset Link",
                text: "Do not share this link to anyone.",
                html: `<a href=${pageurl}>Password Reset Link</a>`,
            };
            transport.sendMail(mailOptions, (err, info) => {
              if (err) return res.send(err);
              console.log(info);
              user.resetPasswordToken = 1;
              user.save();
              return res.send(
                  "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
              );
          });
  })
  .catch((err)=> res.send(err));
});

router.get('/change-password/:id',  function(req, res, next) {
  res.render('changepassword', { id:req.params.id });
});

router.post('/change-password/:id',  function(req, res, next) {
  User.findById(req.params.id)
  .then((user)=> user.setPassword(req.body.password,function(err){
    if(err) return res.send(err);
    user.save();
    res.redirect('/');
  }))
  .catch((err)=> res.send(err));
});

router.get('/search', IsloggedIn, function(req, res, next) {
  res.render('search', { title: 'Express' });
});
router.get('/explore', function(req, res, next) {
  res.render('explore', { title: 'Express' });
});
router.get('/notification', function(req, res, next) {
  res.render('notification', { title: 'Express' });
});


// Create Post

router.get('/create', function(req, res, next) {
  res.render('create', { title: 'Express'  });
});

router.post('/create',upload.single('image'), function(req, res, next) {
   const newpost = new Post({
  author:req.user._id,
  image:req.file.filename,
  location:req.body.location,
  comment:req.body.comment
   })
   req.user.home.push(newpost._id);
   req.user.save();
   newpost.save();
   res.redirect('/home')
});

// User.profile

router.get('/profile', IsloggedIn, function(req, res, next) {
  res.render('profile', {user:req.user});
});

// router.post('/profile', function(req, res, next) {

// });

router.get('/resetpassword', IsloggedIn, function(req, res, next) {
  res.render('resetpassword',{user:req.user});
});

router.post('/resetpassword', IsloggedIn, function(req, res, next) {
  req.user.changePassword(req.body.oldpassword,req.body.password,
  function(err){
    if(err) return res.send(err)
    res.redirect('/')
  }
  )

});

router.get('/edit', IsloggedIn, function(req, res, next) {
  res.render('edit', {user:req.user});
});

router.post('/edit', upload.single('avatar'), function(req, res, next) {

const updatedUser = {
  name: req.body.name,
  username:req.body.username,
  about:req.body.about,
}
if(req.file){
  fs.unlinkSync(
    path.join(__dirname,"..","public","uploads",req.body.oldavatar)
  );
  updatedUser.avatar = req.file.filename;
}

User.findByIdAndUpdate(req.user._id, updatedUser)
        .then(() => {
            res.redirect("/profile");
        })
        .catch((err) => res.send(err));

});





// Middleware

function IsloggedIn (req,res,next){
  if(req.isAuthenticated())
  return next();
  res.redirect('/');
}
module.exports = router;