//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require('express-session');
const mongoose = require("mongoose");
const Mongoose = require('mongoose').Mongoose;
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Tanishq.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const mongoose1 = new Mongoose();
const mongoose2 = new Mongoose();
mongoose1.connect("mongodb://localhost:27017/userDB", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
mongoose1.set("useCreateIndex", true);
mongoose2.connect("mongodb://localhost:27017/questionDB", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
mongoose2.set("useCreateIndex", true);

const db=mongoose2.connection;

module.exports.models = {
  connection: 'mongodb',
  migrate: 'safe'
};

const userSchema = new mongoose1.Schema ({
  email: String,
  password:String,
  googleId: String,
  questions:{
    type:[]
  }
});

const qSchema = new mongoose2.Schema({
ques:String,
o1:String,
o2:String,
o3:String,
o4:String,
a:String
});

const Ques=mongoose2.model("Question",qSchema);


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose1.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: "1038262990452-9jkrtqq876dc7pb0uo3sb62qm4g1sp03.apps.googleusercontent.com",
    clientSecret:"P5ObbagAWaW_5uxE_4ThJCWP",
    callbackURL: "http://localhost:3000/auth/google/options ",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  ));

app.get("/", function(req, res){
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);


app.get("/auth/google/options",
  passport.authenticate('google', { failureRedirect: "/home" }),
  function(req, res) {
    // succesful authentication
    res.redirect("/options");
  });


  app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });


  app.get("/options",function(req,res){
    if(req.isAuthenticated()){
      res.render("options");
    }else{
    res.redirect("/");
    }
  });

  // app.get("/options",function(req,res){
  //     res.render("options");
  //   });

  app.get("/question",function(req,res){
    res.render("question");
  });

app.get("/questions",function(req,res){

  Ques.find({},function(err,quesF){
      res.render("questions",{ques1:quesF});
  });
});

  app.post("/question",function(req,res){

    const ques=req.body.ques;
    const o1=req.body.o1;
    const o2=req.body.o2;
    const o3=req.body.o3;
    const o4=req.body.o4;
    const a=req.body.a;

    const q= new Ques({
      ques:ques,
      o1:o1,
      o2:o2,
      o3:o3,
      o4:o4,
      a:a
    });

    console.log(ques);
    q.save(function(err,ques){
      if(err){
        console.log(err);
      }else{
      return  res.redirect("success");
      }
    });

  //   const data={
  //     ques:ques,
  //     o1:o1,
  //     o2:o2,
  //     o3:o3,
  //     o4:o4,
  //     a:a
  //   };
  //   db.collection("questions").insertOne(data, function(err,collection){
  //     if(err) throw err;
  //     console.log("Question inserted Succefully");
  //   });
  //   return res.redirect("success");
  });

  app.post("/questions",function(req,res){
    const arr=[];
    for(var i=0;i<req.body.question.length;i++){
      arr.push(question[i]);
    }
    User.findById(req.user.id, function(err, foundUser){
      if(err){
        console.log(err);
      }else{
        if(foundUser){
          foundUser.questions= arr;
          foundUser.save(function(){
            res.redirect("/success1");
          });
        }
      }
    });
  });

app.get("/unanswer",function(req,res){
  var ques=[];
  User.findById(req.user.id, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
          ques=foundUser.questions;
      }
    }
  });
  Ques.find({},function(err,quesF){
      const aques=quesF;
  });
  const sques=[];
  var i;
  for(i=0;i<ques.length;i++){
    if(ques[i]==null){
      sques.push(aques[i]);
    }
  }

  // for recently inserted questions!!
  for(;i<aques.length;i++){
    sques.push(aques[i]);
  }

  res.render("unanswer",{ques2:sques});
});

app.get("/resume",function(req,res){
  var ques=[];
  var uques=[];
  User.findById(req.user.id, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
          ques=foundUser.questions;
      }
    }
  });
  Ques.find({},function(err,quesF){
      const aques=quesF;
  });
var i=0,ans;
for(;i<ques.length;i++){
  if(ques[i]!=null)
  ans=i;
}

for(var j=ans+1;j<aques.length;j++)
uques.push(aques[j]);

res.render("resume",{ques3:uques});
});


// app.get("/success",function(req,res){
// res.render("success");
// });

  app.listen(3000, function() {
    console.log("Server started on port 3000.");
  });
