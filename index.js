const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require('express-session');
const flash = require('connect-flash');
require("dotenv").config();

// import landing page
const landingRoutes= require('./routes/landing');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
// import cloudinary
const cloudinaryRoutes = require('./routes/cloudinary.js')


const FileStore = require('session-file-store')(session);

// import csurf (this is to prevent csrx attacks)
const csrf = require('csurf')

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

// set up sessions
app.use(session({
  'store': new FileStore(),
  'secret': "keyboard cat",
  'resave': false, // we will not resave the session if there are no changes
  'saveUninitialized': true // if a client connects with no session, immediately create one
}));


app.use(flash())

// Register Flash middleware
app.use(function (req, res, next) {
    res.locals.success_messages = req.flash("success_messages");
    res.locals.error_messages = req.flash("error_messages");
    next();
});

// Share the user data with hbs files (this is global middleware)
app.use(function(req,res,next){
  res.locals.user = req.session.user;
  next();
})

// enable CSRF
app.use(csrf());

// !!!###this must be immediately after the app.use(csrf()).###!!!
app.use(function (err, req, res, next) {
  if (err && err.code == "EBADCSRFTOKEN") {
      req.flash('error_messages', 'The form has expired. Please try again');
      res.redirect('back');
  } else {
      next()
  }
});

async function main() {
  // this is where the landing and extension runs in the webpage. without this, webpage wont load
  // if the URL begins exactly with a forward slash
  // use the landingRoutes
  app.use('/', landingRoutes);
  app.use('/products', productRoutes);
  app.use('/users', userRoutes);
  app.use('/cloudinary', cloudinaryRoutes);
}

// Share CSRF with hbs files
app.use(function(req,res,next){
  res.locals.csrfToken = req.csrfToken();
  next();
})

main();

app.listen(3000, () => {
  console.log("Server has started");
});

