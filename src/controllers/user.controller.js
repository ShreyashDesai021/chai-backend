//src/controllers/user.controller.js

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler(async (req,res) => {
    // get user details from frontend
    // validate user details - e.g not empty
    // check if user already exists in database : username , email
    // check for images, check for avatar
    //upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token from response
    // check for user creation
    // return response to frontend

    const {fullName, email, username, password} = req.body 
    
    // if(fullName === ""){
    //     throw new ApiError(400, "Full name is required")
    // }

    if(
        [fullName, email, username, password].some((field) => 
        field?.trim() === "")
    ){
        throw new ApiError(400,"All Fields are Required")
    }

    const existedUser = User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path // this is the path of the uploaded avatar image on the server, we will use this path to upload the image to cloudinary and then delete it from our local server, this is a temporary storage location for the uploaded files before they are uploaded to cloudinary

    const coverImageLocalPath = req.files?.coverImage[0]?.path // this is the path of the uploaded cover image on the server, we will use this path to upload the image to cloudinary and then delete it from our local server, this is a temporary storage location for the uploaded files before they are uploaded to cloudinary

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)

    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(500,"Error while uploading avatar")
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url, // cover image is optional, so we will use optional chaining to check if the cover image is uploaded or not, if it is not uploaded then we will set it to null
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user.id).select(  // check if user is created successfully, we will fetch the user from the database and check if it is created successfully, we will also exclude the password and refresh token from the response
        "-password -refreshToken" // we are using select to exclude the password and refresh token from the response, we don't want to send these sensitive information to the frontend
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating user")
    }

    return res.status(201).json( // we will return the created user to the frontend, we will also send a success message and the status code
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )


})

export {registerUser};