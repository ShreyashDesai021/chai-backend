//src/index.js
//require("dotenv").config(); // Load environment variables from .env file    
//above syntax is also valid but we want consistency between reuire and import

import dotenv from "dotenv";

import mongoose from "mongoose";
import {DB_NAME } from "./constants.js"
import connectDB from "./db/index.js";
import express from "express";

import { app } from "./app.js";

dotenv.config(); // Load environment variables from .env file 

connectDB() // Since it is a async func it returns a promise so we can use .then() and .catch() to handle the promise. We can also use async/await to handle the promise but we will use .then() and .catch() for now.
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((err) => {
    console.log("Error connecting to MongoDB:", err);
})
























/*
First approach : All the code is in one file (index.js). 
This is not a good approach as it makes the code messy and hard to maintain. We will refactor the code later to make it more modular and maintainable.
import express from "express";
const app = express();

;(async () => {  //using an IIFE to allow async/await at the top level
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.error("Error starting the server:", error);
            throw error
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
    }
})();*/