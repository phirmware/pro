var express = require("express");
var app = express();
const mongoose = require("mongoose");
var path = require('path');
var async = require('async');
var nodeMailer = require('nodemailer');
var crypto = require('crypto');
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
mongoose.Promise = Promise;


app.use(flash());


//setup express session
app.use(require('express-session')({
  secret: 'X2YT*xeQ6a7m_v%wqArWZ_QS*?kzLRH7BfexM=tC3*ff_774$m',
  resave: false,
  saveUninitialized: false
}));


// set storage engine
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

//file filter
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
}

// init upload
// upload image for user page 
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: imageFilter
}).single('myImage')

// upload image for card .....
const upload1 = multer({
  storage: storage,
  limits: { fileSize: 10000000 },
  fileFilter: imageFilter
}).single('thumbnail')

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'phirmware',
  api_key: 638134991796689,
  api_secret: 'tAPIDGgjsVWvv_2gHZ4-8V_Qr6Q'
});

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
  console.log(req.user);
  res.render("index", { user: req.user, success: req.flash('success'), error: req.flash('error') });
});

//render features page
app.get("/features", (req, res) => {
  res.render("landing-v1-features", { user: req.user });
});

//render login page
app.get("/login", (req, res) => {
  console.log(req.user);
  res.render("landing-v1-login", { error: req.flash("Error"), success: req.flash('success') });
});

//post to login route
app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: 'Login Failed!!'
}), (req, res) => { });

//privacy
app.get('/privacy', (req, res) => {
  res.render('privacy');
});

//render signup page
app.get("/signup", (req, res) => {
  res.render("landing-v1-signup", { user: req.user, error: req.flash('Error') });
});

// Signup a new user 
app.post('/signup', (req, res) => {
  var newUser = new db.userlogin({ username: req.body.username, email: req.body.email });
  db.userlogin.register(newUser, req.body.password, (err, user) => {
    if (err) {
      req.flash("Error", err);
      res.redirect('/signup');
    } else {
      passport.authenticate('local')(req, res, function () {
        async.waterfall([
          function (done) {
            crypto.randomBytes(20, function (err, buf) {
              var token = buf.toString('hex');
              done(err, token);
            });
          },
          function (token, done) {
            db.userlogin.findOne({ username: req.body.username }, function (err, user) {
              if (!user) {
                req.flash('Error', 'No account with that email address exists.');
                return res.redirect('/signup');
              }
      
              user.verificationToken = token;
              user.verificationExpires = Date.now() + 3600000;  //1 hour
      
              user.save(function (err) {
                done(err, token, user);
              });
            });
          },
          function (token, user, done) {
            var smtpTransport = nodeMailer.createTransport({
              service: 'Gmail',
              auth: {
                user: 'chibuzor.ojukwu@gmail.com',
                pass: '09036229746'
              }
            });
            var mailOptions = {
              to: user.email,
              from: 'chibuzor.ojukwu@gmail.com',
              subject: 'Verify your Email Address',
              text: `Please click on the following link or paste into your browser to verify your Email
              http://${req.headers.host}/verify/${token} `
            };
            smtpTransport.sendMail(mailOptions, function (err) {
              console.log('mail sent');
              req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions');
              done(err, 'done');
            });
          }
        ], function (err) {
          if (err) return res.send(err);
          res.redirect('/dashboard');
        });
        // res.redirect('/register');
      })
    }
  })
});

//verify email address
app.get('/verify/:id',(req,res)=>{
  db.userlogin.findOne({ verificationToken: req.params.id, verificationExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Verification token is invalid or has expired.');
      res.redirect('/login');
    } else{
      user.verificationExpires = undefined;
      user.verificationToken = undefined;
      user.verified = true;
      user.save();
      req.flash('success', 'Verification successfull.');
      res.redirect('/dashboard');
    }
  });
})

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

// Find user detail for portfolio
app.get("/portfolio/:id", (req, res) => {
  db.user.find({ section: 'portfolio' }).then(comps => {
    var detail = comps.filter(function (company) {
      return company.company == req.params.id;
    });
    res.render("service", { service: detail, user: req.user, company: req.params.id });
  }).catch(err => {
    res.redirect('/');
  });
});

// Find user detail for business page
app.get('/company/:id', (req, res) => {
  db.user.find({ section: 'Business-page' }).then(comps => {
    var detail = comps.filter(function (company) {
      return company.company == req.params.id;
    });
    res.render('company', { service: detail, company: req.params.id, user: req.user });
  }).catch(err => {
    res.redirect('/');
  });
});


// get edit portfolio page
app.get("/service/:id/edit", isUser, (req, res) => {
  db.details.find({ company: req.params.id }).then(comp => {
    res.render('edit', { company: req.params.id, detail: comp });
  }).catch(err => {
    res.redirect('/service/' + req.params.id);
  });
});

//update edit portfolio section
app.put("/service/:id/edit", (req, res) => {
  console.log(req.body);
  db.details.findOneAndUpdate({ company: req.params.id }, req.body, (err, detail) => {
    if (err) {
      res.redirect('/portfolio/' + req.params.id + '/edit');
    } else {
      res.redirect('/portfolio/' + req.params.id);
    }
  });
});


// get edit company page
app.get("/company/:id/edit", isUser, (req, res) => {
  db.details.find({ company: req.params.id }).then(comp => {
    res.render('edit-company-details', { company: req.params.id, detail: comp });
  }).catch(err => {
    res.redirect('/service/' + req.params.id);
  });
});


//update edit company section
app.put("/company/:id/edit", (req, res) => {
  console.log(req.body);
  db.details.findOneAndUpdate({ company: req.params.id }, req.body, (err, detail) => {
    if (err) {
      res.redirect('/company/' + req.params.id + '/edit');
    } else {
      res.redirect('/company/' + req.params.id);
    }
  });
});



//get register page
app.get('/register', isUser, (req, res) => {
  res.render('register', { user: req.user, error: req.flash('Error') });
});

//register user
app.post("/register", isUser, function (req, res) {
  upload1(req, res, (err) => {
    if (err) {
      res.redirect('/register');
    } else {
      var usr = {
        section: req.body.section,
        username: req.user.username,
        user: req.body.user,
        company: req.body.company.replace(/ /g, '-'),
        service: req.body.service,
        email: req.body.email,
        phone: req.body.phone,
        country: req.body.country,
        location: req.body.location,
        plan: req.body.plan,
        category: req.body.category,
        thumbnail: '/uploads/' + req.file.filename
      }

      db.user.create(usr)
        .then(user => {
          db.details.create({ company: req.body.company.replace(/ /g, '-') });
          db.colors.create({ company: req.body.company.replace(/ /g, '-') });
          if (req.body.section == 'portfolio') {
            res.redirect('/portfolio/' + usr.company);
          } else if (req.body.section == 'Business-page') {
            res.redirect('/company/' + usr.company);
          }
        })
        .catch(err => {
          req.flash("Error", err);
          res.redirect('back');
        });
    }
  });
});


//get comment route and redirect user 
app.get('/comment', isUser, (req, res) => {
});


// render dashboard page
app.get('/dashboard', isUser, (req, res) => {
  db.user.find({ username: req.user.username }).then(user => {
    res.render('dashboard', { user: user, presentUser: req.user.username , error: req.flash("Error"), success: req.flash('success')});
  });
});


// show edit company page
app.get('/edit-service/:id', (req, res) => {
  db.user.find({ company: req.params.id }).then(comp => {
    res.render('edit-company', { company: comp, error: req.flash('Error') });
  });
});


// update service 
app.put('/edit-service/:id', isUser, upload1, (req, res) => {
  cloudinary.uploader.upload(req.file.path, function (result) {
    var usr = {
      user: req.body.user,
      company: req.params.id,
      service: req.body.service,
      email: req.user.username,
      phone: req.body.phone,
      country: req.body.country,
      location: req.body.location,
      plan: req.body.plan,
      category: req.body.category,
      thumbnail: result.secure_url
    }
    db.user.findOneAndUpdate({ company: req.params.id }, usr, (err, updatedUser) => {
      if (err) {
        req.flash('Error', err);
        res.redirect('/edit-service/' + req.params.id);
      } else {
        res.redirect('/service/' + req.params.id);
      }
    });
  })
});


// post to get email and url
app.post('/forgot', (req, res) => {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      db.userlogin.findOne({ username: req.body.username }, function (err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/login');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;  //1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodeMailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'chibuzor.ojukwu@gmail.com',
          pass: '09036229746'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'chibuzor.ojukwu@gmail.com',
        subject: 'Node.js Password Reset',
        text: `You are recieving this because you have requested the reset of password.
        Please click on the following link or paste into your browser to complete the process
        http://${req.headers.host}/reset/${token} `
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions');
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) return res.send(err);
    res.redirect('/login');
  });
});


//reset password page
app.get('/reset/:id', (req, res) => {
  db.userlogin.findOne({ resetPasswordToken: req.params.id, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/login');
    }
    res.render('reset', { token: req.params.id });
  });
});


// reset password
app.post('/reset/:id', function (req, res) {
  async.waterfall([
    function (done) {
      db.userlogin.findOne({ resetPasswordToken: req.params.id, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) {
              req.logIn(user, function (err) {
                done(err, user);
              });
            });
          })
        } else {
          req.flash('error', 'Passwords do not match.');
          return res.redirect('back');
        }
      });
    },
    function (user, done) {
      var smtpTransport = nodeMailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'chibuzor.ojukwu@gmail.com',
          pass: '09036229746'
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'chibuzor.ojukwu@gmail.com',
        subject: 'Your password has been reset',
        text: 'Your password has been reset'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success', 'Success! , Your password has been changed ');
        done(err);
      });
    }
  ], function (err) {
    res.redirect('/');
  });
})

//middleware => protects admin routes
function isUser(req, res, next) {
  if (req.user) {
    next();
  } else {
    req.flash("Error", "Please Log in");
    res.redirect('/login');
  }
}

//render upload page
app.get('/service/upload-picture/:id', (req, res) => {
  res.render('upload', { company: req.params.id });
});

//upload picture
app.post('/service/upload-picture/:id', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('upload', {
        msg: err
      });
    } else {
      db.image.create({ company: req.params.id, image: req.file.filename }).then(img => {
        res.redirect('/portfolio/' + req.params.id);
      }).catch(err => {
        res.redirect('/portfolio/' + req.params.id);
      });
    }
  })
});

//logout user
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

//set api prefix for services route
app.use("/api/service", serviceRoutes);


//listen at port 3042
app.listen(port, () => {
  console.log("Listening at port 3042");
});
