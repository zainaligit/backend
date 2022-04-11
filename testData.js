const app = require('express');
const { default: mongoose } = require('mongoose');
const mongo = require('mongoose');

//connection string
mongo.connect("mongodb://localhost:27017/testsave").then(() => console.log('connection successfull')).catch((error) => console.log(error));

//creating db schema object
const testSchema = new mongoose.Schema({
  name: String,
  gender: String,
  age: Number,
})
//creating collections using model class it start with PascalCase
const User = new mongoose.model('User', testSchema); 
//now we are creating a document
//always use async/await & try/catch for saving documents bcz it gives use better output
const createDocument = async () => {

  try {
    const userData = new User({
      name: 'asim',
      gender: 'male',
      age: 25,
    })

    const employeeData = new User({
      name: 'arslan',
      gender: 'male',
      age: 25,
    })

    //inserting many
    const saved = await User.insertMany([userData,employeeData]);
    console.log(saved);

  } catch (error) {
    console.log(error);
  }
}

createDocument();
//inserting only one documment
/*
const createDocument = async () => {

  try {
    const userData = new User({
      name: 'asim',
      gender: 'male',
      age: 25,
    })

    //inserting One Document
    const saved = await userData.save();
    console.log(saved);

  } catch (error) {
    console.log(error);
  }
}

createDocument();
*/