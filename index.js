var express = require("express");
var app = express();
const mongoose = require("mongoose");
var port = process.env.PORT || 3042;
app.set("view engine", "ejs");
var serviceRoutes = require("./routes/service");
var db = require("./models");
const bodyParser = require("body-parser");
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
mongoose.Promise = Promise;


//setup express session
app.use(require('express-session')({
  secret: 'Im phirmware',
  resave: false,
  saveUninitialized: false
}));

//setup passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(db.userlogin.authenticate()));
passport.serializeUser(db.userlogin.serializeUser());
passport.deserializeUser(db.userlogin.deserializeUser());

//cofigure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//use static files
app.use(express.static(__dirname + "/views"));
app.use(express.static(__dirname + "/public"));

//render root route
app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

//render features page
app.get("/features", (req, res) => {
  res.render("landing-v1-features", { user: req.user });
});


//render login page
app.get("/login", (req, res) => {
  res.render("landing-v1-login", { user: req.user });
});

//post to login route
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}), (req, res) => { });


//render signup page
app.get("/signup", (req, res) => {
  res.render("landing-v1-signup", { user: req.user });
});

// Signup a new user 
app.post('/signup', (req, res) => {
  db.userlogin.register(new db.userlogin({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/');
      })
    }
  })
});

// render pricing page
app.get("/pricing", (req, res) => {
  res.render("landing-v1-pricing", { user: req.user });
});

//render services page
app.get("/services", (req, res) => {
  db.user
    .find()
    .then(services => {
      res.render("services", { services: services, user: req.user });
    })
    .catch(err => {
      console.log(err);
    });
});

// Find user detail
app.get("/service/:id", (req, res) => {
  db.user
    .find({ company: req.params.id })
    .then(detail => {
      console.log(detail);
      res.render("service", { service: detail });
    })
    .catch(err => {
      console.log(err);
    });
});

//get register page
app.get('/register', isUser, (req, res) => {
  res.render('register', { user: req.user });
});


//register user
app.post("/register", isUser, function (req, res) {
  req.body.company.replace(/ /g,'-');
  var usr = {
    user:req.body.user,
    company: req.body.company.replace(/ /g,'-'),
    service: req.body.service,
    email: req.body.email,
    phone: req.body.phone,
    country: req.body.country,
    location:req.body.location,
    plan: req.body.plan,
    category:req.body.category,
    details:req.body.details
  }
  db.user.create(usr)
    .then(user => {
      res.redirect('/services');
    })
    .catch(err => {
      res.redirect('/register');
    });
});


// render dashboard page
app.get('/dashboard',(req,res)=>{
  res.render('dashboard');
});

//middleware => protects admin routes 
function isUser(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
}


//set api prefix for services route
app.use("/api/service", serviceRoutes);


//listen at port 3042
app.listen(port, () => {
  console.log("Listening at port 3042");
});
