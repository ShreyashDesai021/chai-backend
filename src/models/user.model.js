// src/models/user.model.js

// mongo stores id not in json format but in binary format(bson) but mongoose converts it to string and we can use it as string in our code

import mongoose, {Schema} from "mongoose"; // we are importing mongoose and Schema from mongoose package
// what is schema ? it is a blueprint for our data, it defines the structure of our data and the type of data we want to store in our database
import bcrypt from "bcrypt"; // we are importing bcrypt package to hash our passwords before storing them in the database
import jwt from "jsonwebtoken"; // we are importing jsonwebtoken package to generate and verify JSON Web Tokens (JWTs) for authentication and authorization in our application

const userSchema = new Schema(
    {
      username : {
        type : String,
        required : [true, "Username is required"], // this means that the username field is required and if we try to save a user without a username, it will throw an error with the message "Username is required"
        unique : true,
        lowercase : true,
        trim : true,
        index : true // this will create an index on the username field which will improve the performance of our queries when we search for a user by username
                     // to make any field in database seacrhable in optimized way make it index, it will create a B-tree index on the username field which will allow us to search for a user by username in logarithmic time complexity O(log n) instead of linear time complexity O(n) if we don't have an index on the username field
                     // it increases the cost of write operations because it has to update the index every time we insert, update or delete a user but it improves the performance of read operations when we search for a user by username
        },
      email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
      },   
        fullName : {
        type : String,
        required : true,
        trim : true,
        index : true
      }, 
      avatar : {
        type : String, // cloudinary url of the image
        required : true,
      },
      coverimage : {
        type : String, // cloudinary url of the image
        required : false
      },
      watchHistory : {
        type : Schema.Types.ObjectId,
        ref : "Video", // this means that the watchHistory field is a reference to the Video model, it will store the id of the video that the user has watched
      },
      password : {
        type : String,
        required : [true, "Password is required"],

      },
      refreshToken : {
        type : String
      }
    },
    {
        timestamps : true // this will add createdAt and updatedAt fields to our user model which will store the date and time when the user was created and updated
    }       
)

userSchema.pre("save",async function (next) { // why is this function not an arrow function ? because we need to use the "this" keyword to access the user document that is being saved, if we use an arrow function, the "this" keyword will refer to the global object and not the user document, so we need to use a regular function to access the user document using the "this" keyword
                                              // why we use (next) here ? because it is a middleware function and we need to call the next() function to pass the control to the next middleware function in the stack, if we don't call next(), the request will be stuck and will not proceed to the next middleware function or the route handler

    if(!this.isModified("password")) return next(); // this means that if the password field is not modified, then we don't need to hash the password again and we can simply proceed to the next middleware function or the route handler, this is useful when we are updating a user and we don't want to hash the password again if it is not modified
    this.password = await bcrypt.hash(this.password,10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password) // this will compare the plain text password with the hashed password stored in the database and return true if they match and false if they don't match
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema); // we are creating a model called User using the userSchema and exporting it so that we can use it in other parts of our application

// bcrypt is a library that we can use to hash our passwords before storing them in the database, it is a one-way hashing algorithm which means that we cannot retrieve the original password from the hashed password, it is a secure way to store passwords in the database because even if someone gets access to our database, they will not be able to retrieve the original passwords of our users, we can use bcrypt to hash our passwords before saving them to the database and to compare the hashed password with the plain text password when a user tries to log in.

//jsonwebtoken is a library that we can use to generate and verify JSON Web Tokens (JWTs), it is a compact and self-contained way to transmit information between parties as a JSON object, it is commonly used for authentication and authorization in web applications, we can use jsonwebtoken to generate a JWT when a user logs in and to verify the JWT when the user makes a request to a protected route, it allows us to securely transmit information between the client and the server without having to store any session information on the server.
// JWT is a bearer token which means that the client needs to include the token in the Authorization header of the request when making a request to a protected route, the server will then verify the token and allow access to the protected route if the token is valid, otherwise it will return an error response indicating that the user is not authorized to access the route.
// jwt has three parts : header, paylaod and signature.
// header contains the type of the token and the algorithm used to sign the token
// payload contains the data that we want to transmit, it can be any data that we want to include in the token, it is usually a JSON object that contains the user id and other relevant information about the user
// signature is used to verify the authenticity of the token, it is generated by taking the header and the payload and signing them with a secret key using the algorithm specified in the header, when we receive a token from the client, we can verify its authenticity by taking the header and the payload and signing them with the same secret key and comparing it with the signature in the token, if they match, then we can trust that the token is valid and has not been tampered with.
// show with example :
/********** Example of JWT **********/
// const jwt = require("jsonwebtoken");
// const secretKey = "mysecretkey";
// const payload = {
//     userId : "12345",
//     username : "john_doe"
// }
// // Generating a JWT
// const token = jwt.sign(payload, secretKey, {expiresIn : "1h"});
// console.log("Generated JWT : ", token);
// // Verifying a JWT
// try{
//     const decoded = jwt.verify(token, secretKey);
//     console.log("Decoded JWT : ", decoded);
// }catch(error){
//     console.log("Invalid token");
// }


// Direct encryption is not possible hence we take help of mongoose hooks
// Pre hook is a middleware function that is executed before a certain event occurs, in this case, we can use a pre hook to hash the password before saving the user to the database, we can use the bcrypt library to hash the password in the pre hook, this way we can ensure that the password is always hashed before it is stored in the database and we don't have to worry about hashing the password every time we create a new user or update the password of an existing user.
// we can use the pre hook on the "save" event of the userSchema, this means that the pre hook will be executed every time we try to save a user to the database, whether it is a new user or an existing user that we are updating, in the pre hook, we can check if the password field has been modified, if it has been modified, then we can hash the new password using bcrypt and save the hashed password to the database, if it has not been modified, then we can simply proceed with saving the user without hashing the password again.
