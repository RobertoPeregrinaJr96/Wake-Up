const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a schema for your data
const exampleSchema = new Schema({
  name: String,
  age: Number,
});

// Create a model based on the schema
const ExampleModel = mongoose.model('Example', exampleSchema);

// Example CRUD operation
const exampleInstance = new ExampleModel({
  name: 'John Doe',
  age: 25,
});

// Save the instance to the database
exampleInstance.save((err, result) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Data saved to MongoDB:', result);
  }
});
