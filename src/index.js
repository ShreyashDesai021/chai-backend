//src/index.js
//require("dotenv").config(); // Load environment variables from .env file    
//above syntax is also valid but we want consistency between reuire and import

import dotenv from "dotenv";

import mongoose from "mongoose";
import {DB_NAME } from "./constants.js"
import connectDB from "./db/index.js";

dotenv.config(); // Load environment variables from .env file 

connectDB(); // Call the function to connect to the database

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