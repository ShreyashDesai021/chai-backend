//src/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express(); 

app.use(cors({ 
    origin: process.env.CORS_ORIGIN,
    credentials: true, 
})); 
app.use(express.json({ 
    limit : "16kb" 
})); 
app.use(express.urlencoded({ 
    limit : "16kb",
    extended : true 
}));
app.use(express.static("public")) 
app.use(cookieParser());

//routes import

import userRouter from './routes/user.routes.js';



// routes declaration

//app.use("/users", userRouter);
// http://localhost:8000/users/

app.use("/api/v1/users", userRouter); // since we are defining our api we will write the url in such way. we also mention the version v1

// http://localhost:8000/api/v1/users/register

export { app }; 