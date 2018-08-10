var express = require("express");
var router = express.Router();
var db = require("../models");
var async = require('async');
var nodeMailer = require('nodemailer');
var crypto = require('crypto');


//Get all services
router.get('/', (req, res) => {
    db.user.find().then(users => {
        res.json(users);
    }).catch(err => {
        console.log(err);
    });
});

//Get all services
router.get("/portfolio", (req, res) => {
    db.user
        .find({ section: 'portfolio' })
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

//Find users in a country
router.post('/country', (req, res) => {
    db.user.find({ country: req.body.country }).then(users => {
        res.json(users);
    }).catch(err => {
        console.log(err);
    });
});

// Get all comments
router.get('/comments/:id', (req, res) => {
    db.comments.find({ company: req.params.id }).then(comments => {
        res.json(comments);
    }).catch(err => {
        res.send(err);
    });
});

//post comment route
router.post("/service/:id", (req, res) => {
    db.comments.create(req.body).then((comment) => {
        res.json(comment);
    }).catch(err => {
        res.send(err);
    });
});

//get user image
router.get("/image/:id", (req, res) => {
    db.image.find({ company: req.params.id }).then(image => {
        res.json(image);
    }).catch(err => {
        res.send(err);
    });
});

// get user details
router.get('/details/:id', (req, res) => {
    db.details.find({ company: req.params.id }).then(detail => {
        res.json(detail);
    }).catch(err => {
        res.send(err);
    });
});

//get color
router.get('/color/:id', (req, res) => {
    db.colors.find({ company: req.params.id }).then(color => {
        res.json(color);
    })
});

//update color
router.post('/color/:id', (req, res) => {
    db.colors.findOneAndUpdate({ company: req.params.id }, { company: req.params.id, headerColor: req.body.color }, { new: true }, (err, color) => {
        if (err) {
            res.send(err);
        } else {
            res.send(color);
        }
    })
});

router.get('/isVerified/:id',(req,res)=>{
    db.userlogin.find({username:req.params.id}).then(user=>{
        res.send({response:user[0].verified});
    });
});


//export the router module
module.exports = router;