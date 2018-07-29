var express = require("express");
var app = express();
const mongoose = require("mongoose");
var path = require('path');
var multer = require('multer');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var port = process.env.PORT || 3042;
app.set("view engine", "ejs");
var serviceRoutes = require("./routes/service");
var db = require("./models");
const bodyParser = require("body-parser");
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
mongoose.Promise = Promise;


app.use(flash());


//setup express session
app.use(require('express-session')({
  secret: 'Im phirmware',
  resave: false,
  saveUninitialized: false
}));


// set storage engine
const storage = multer.diskStorage({
  destination:'./public/uploads',
  filename:function(req,file,cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// init upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 10000000}
}).single('myImage')

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
app.use(methodOverride("_method"));


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
  res.render("landing-v1-login", {error:req.flash("Error")});
});

//post to login route
app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}), (req, res) => { });

//render signup page
app.get("/signup", (req, res) => {
  res.render("landing-v1-signup", { user: req.user,error:req.flash('Error') });
});

// Signup a new user 
app.post('/signup', (req, res) => {
  db.userlogin.register(new db.userlogin({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      req.flash("Error",err);
      res.redirect('/signup');
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
      res.render("service", { service: detail,user:req.user,company:req.params.id });
    })
    .catch(err => {
      console.log(err);
    });
});


// get edit page
app.get("/service/:id/edit",isUser,(req,res)=>{
  db.details.find({company:req.params.id}).then(comp=>{
    res.render('edit',{company:req.params.id,detail:comp});
  }).catch(err=>{
    res.redirect('/service/' + req.params.id);
  });
});

//update edit section
app.put("/service/:id/edit",(req,res)=>{
  console.log(req.body);
  db.details.findOneAndUpdate({company:req.params.id},req.body,(err,detail)=>{
    if(err){
      res.redirect('/service/' + req.params.id + '/edit');
    } else{
      res.redirect('/service/' + req.params.id);
    }
  });
});

//get register page
app.get('/register', isUser, (req, res) => {
  res.render('register', { user: req.user,error:req.flash('Error') });
});

//register user
app.post("/register", isUser, function (req, res) {
  var usr = {
    user:req.body.user,
    company: req.body.company.replace(/ /g,'-'),
    service: req.body.service,
    email: req.user.username,
    phone: req.body.phone,
    country: req.body.country,
    location:req.body.location,
    plan: req.body.plan,
    category:req.body.category,
    details:req.body.details
  }

  db.user.create(usr)
    .then(user => {
      db.details.create({company:req.body.company.replace(/ /g,'-')})
      res.redirect('/services');
    })
    .catch(err => {
      req.flash("Error",err);
      res.redirect('/register');
    });
});

app.get('/comment',isUser,(req,res)=>{
});


// render dashboard page
app.get('/dashboard',(req,res)=>{
  res.render('dashboard',{user:req.user});
});

//middleware => protects admin routes
function isUser(req, res, next) {
  if (req.user) {
    next();
  } else { 
    req.flash("Error","Please Log in");
    res.redirect('/login');
  }
}

//render upload page
app.get('/service/upload-picture/:id',(req,res)=>{
  res.render('upload',{company:req.params.id});
});

app.post('/service/upload-picture/:id',(req,res)=>{
  upload(req,res,(err)=>{
    if(err){
      res.render('upload',{
        msg:err
      });
    } else{
      db.image.create({company:req.params.id,image:req.file.filename}).then(img=>{
        res.redirect('/service/' + req.params.id);
      }).catch(err =>{
        res.redirect('/service/' + req.params.id);
      });
    }
  })
});

//logout user
app.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
});

//set api prefix for services route
app.use("/api/service", serviceRoutes);


//listen at port 3042
app.listen(port, () => {
  console.log("Listening at port 3042");
});
