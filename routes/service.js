var express = require("express");
var router = express.Router();
var db = require("../models");
const path = require("path");
const passport = require("passport");
const localStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const jwt = require("jsonwebtoken");



//Get all services
router.get('/', (req, res) => {
    db.user.find().then(users => {
        res.json(users);
    }).catch(err => {
        console.log(err);
    });
});

//Get all services
router.get("/services", (req, res) => {
    db.user
        .find()
        .then(services => {
            res.json(services);
        })
        .catch(err => {
            console.log(err);
        });
});

// Find users under a specific category
router.post('/category', (req, res) => {
    db.user.find({ category: req.body.category }).then((users) => {
        res.json(users);
    }).catch((err) => {
        console.log(err);
    })
});

// Get all comments
router.get('/comments/:id',(req,res)=>{
    db.comments.find({company:req.params.id}).then(comments=>{
        res.json(comments);
    }).catch(err=>{
        res.send(err);
    });
});

//post comment route
router.post("/service/:id",(req,res)=>{
    db.comments.create(req.body).then((comment)=>{
      res.json(comment);
    }).catch(err=>{
        res.send(err);
    });
  });

//get user image
router.get("/image/:id",(req,res)=>{
    db.image.find({company:req.params.id}).then(image=>{
        res.json(image);
    }).catch(err=>{
        res.send(err);
    });
});

//export the router module
module.exports = router;