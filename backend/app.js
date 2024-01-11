const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { ValidationError } = require('sequelize');
const mongoose = require('mongoose');


const { environment } = require('./config');
const isProduction = environment === 'production';

const app = express();

app.use(morgan('dev'));

app.use(cookieParser());
app.use(express.urlencoded({ extended: false })); // <-- Add this line
app.use(express.json());

// Security Middleware
if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app
app.use(
  helmet.crossOriginResourcePolicy({
    policy: "cross-origin"
  })
);

// Connect all the routes
app.use(routes);

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.title = "Resource Not Found";
  err.errors = { message: "The requested resource couldn't be found." };
  err.status = 404;
  next(err);
});

// Process sequelize errors
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    let errors = {};
    for (let error of err.errors) {
      errors[error.path] = error.message;
    }
    err.title = 'Validation error';
    err.errors = errors;
  }
  next(err);
});

// Error formatter
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack
  });
});

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && "Lax",
      httpOnly: true
    }
  })
);

/*
establish a connection to the MongoDB database
  - the argument "Protocol / default MongoBD server address and port / Name of DB"
  - options to handle URL parsing and ensure the new Server Discovery and Monitoring engine is used.
*/
mongoose.connect(process.env.MongoDbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
/*
Provides a reference to the database connection.
*/
const db = mongoose.connection;
/*
Error handling
*/
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
/*
Once a successful connection happens its prints to the console
*/
db.once('open', () => {
  console.log('Connected to MongoDB');
});
/*
starts the Express server and makes it listen for incoming requests on the specified port variable from the global environmental variable
*/
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
