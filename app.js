const express = require('express')
const session = require('express-session')
const path = require('path')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const userRoute = require("./server/route/userRoute")
const adminRoute = require("./server/route/adminRoute")
require('dotenv').config();

const app = express()

app.set("view engine", "hbs")

const partials = path.join(__dirname, "views/partials")
hbs.registerPartials(partials);

app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next()
});

app.use(session({
  secret: "key123@321yek",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60
  }
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'public')))

app.set('views', [
  path.join(__dirname, 'views/user'),
  path.join(__dirname, 'views/admin')
]);

// to multiply two numbers in the hbs
hbs.registerHelper('multiply', function (a, b) {
  return a * b;
});

// to set the current in the correct format in hbs
hbs.registerHelper('formatDate', function (date) {
  return new Date(date).toDateString();
});

// code to check if the string is equal or note in hbs
hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// used in increment and decrement in cart page of the user
hbs.registerHelper('ifNotEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.inverse(this) : options.fn(this);
});

app.use('/', userRoute)
app.use('/admin', adminRoute)

app.listen(8888, () => console.log(`server started at portnumber : ${process.env.PORT}`))