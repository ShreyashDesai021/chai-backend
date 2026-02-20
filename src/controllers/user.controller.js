//src/controllers/user.controller.js

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"

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



})

export {registerUser};