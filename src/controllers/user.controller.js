//src/controllers/user.controller.js

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false}) // we are setting validateBeforeSave to false because we don't want to run the validation again when we are saving the user after generating the refresh token, we just want to save the refresh token in the database without validating the other fields like email, username etc. because they are not being updated here, we are only updating the refresh token field

        return {accessToken, refreshToken}


    } catch (error) {
        console.error("TOKEN GENERATION ERROR:", error);
        throw new ApiError(500,"Error while generating access and refresh token")
    }
}


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

    const existedUser = await User.findOne({
        $or : [{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path // this is the path of the uploaded avatar image on the server, we will use this path to upload the image to cloudinary and then delete it from our local server, this is a temporary storage location for the uploaded files before they are uploaded to cloudinary

    //const coverImageLocalPath = req.files?.coverImage[0]?.path // this is the path of the uploaded cover image on the server, we will use this path to upload the image to cloudinary and then delete it from our local server, this is a temporary storage location for the uploaded files before they are uploaded to cloudinary

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // in above whatsthe diff between both approaches ? the first appraoch gave error when coverImage field was empty , second didn't . why?

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    console.log("Req.body:",req.body)
    console.log("Req.files:",req.files)
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

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


const loginUser = asyncHandler(async (req,res) => {
    // req body -> data
    // username or email 
    // find the user
    // password check
    // access and refresh token generation
    // send cookie 

    const {email,username,password} = req.body

    if(!username && !email){ // both username and email are required to login
        throw new ApiError(400,"Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}] // this means that we will find the user by either username or email, if we find the user by username then we will check the password, if we find the user by email then we will check the password, this is useful because the user can login using either username or email
    })

    if(!user){
        throw new ApiError(404,"User not found with this username or email")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }

    // difference between User and user here? User is the model which we imported from the user.model.js file, it is used to interact with the database, it has methods like findOne, create, findById etc. user is the instance of the User model which we got after finding the user in the database using the findOne method, it is a document which represents a single user in the database and it has properties like username, email, password etc. and it also has methods like isPasswordCorrect which we defined in the user.model.js file to check if the password is correct or not
     
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true, // this means that the cookie will be accessible only through HTTP protocol and not through JavaScript, this is a security measure to prevent cross-site scripting attacks
        secure : true // this means that the cookie will be sent only over HTTPS and not over HTTP, this is a security measure
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
.json(
    new ApiResponse(
        200,{
            user : loggedInUser,
            accessToken,
            refreshToken
        },
        "User Logged In Successfully"
    )
)
})

const logoutUser = asyncHandler(async(req,res) => {
    // clear the cookie from frontend
    // clear the refresh token from database
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set : {
                    refreshToken : null
                }
            },
            {
                new : true
            }
        )

        const options = {
            httpOnly : true, 
            secure : true 
        }    

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,{}, "User Logged Out Successfully"
            )
        )    
    })  

// what is accesstoken?
// Access token is a short-lived token that is used to access the protected routes of the application, it is usually valid for 15 minutes to 1 hour,
// it is stored in the client side (frontend) and is sent in the Authorization header of the request when accessing the protected routes, 
// it is used to verify the identity of the user and to authorize the user to access the protected resources of the application, 
// it is generated using the user's information and a secret key and is signed using a hashing algorithm like HMAC SHA256, 
// it can be verified using the same secret key to ensure that it has not been tampered with and that it is valid

// what is refresh token?
// Refresh token is a long-lived token that is used to generate a new access token when the access token expires, 
// it is usually valid for 7 days to 30 days, it is stored in the client side (frontend) and is sent in the Authorization header 
// of the request when accessing the protected routes, it is used to verify the identity of the user and to authorize 
// the user to access the protected resources of the application, it is generated using the user's information and a secret key 
// and is signed using a hashing algorithm like HMAC SHA256, it can be verified using the same secret key to ensure that
//  it has not been tampered with and that it is valid, it is used to maintain the user's session without requiring them to log in again 
// when the access token expires, when the access token expires, the frontend can send a request to the backend with the refresh token 
// to get a new access token without requiring the user to log in again

const refreshAccesToken = asyncHandler(async(req,res) =>{
    // get the refresh token from the cookie
    // verify the refresh token
    // if the refresh token is valid, then generate a new access token and refresh token
    // save the new refresh token in the database
    // send the new access token and refresh token to the frontend in cookie and response

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken // req.body.refreshToken is used for mobile applications where we cannot store the refresh token in the cookie, so we send the refresh token in the request body and get it from there, for web applications we can store the refresh token in the cookie and get it from there, so we can support both web and mobile applications by checking for the refresh token in both places


    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }




})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new ApiError(401,"Old password is incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName , email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"Full name and email are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200, user, "Account details updated successfully")
    )

    const updateUserAvatar = asyncHandler(async(req,res) => {
        const avatarLocalPath = req.file?.path

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar image is required")
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath)

        if(!avatar.url){
            throw new ApiError(400,"Error while uploading avatar")
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set : {
                    avatar : avatar.url
                }
            },
            {new: true}
        ).select("-password")

        return res.status(200).json(
            new ApiResponse(200, user, "Avatar updated successfully")
        )
    })

    const updateUserCoverImage = asyncHandler(async(req,res) => {
        const coverImageLocalPath = req.file?.path

        if(!coverImageLocalPath){
            throw new ApiError(400,"Cover image is required")
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!coverImage.url){
            throw new ApiError(400,"Error while uploading cover image")
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set : {
                    coverImage : coverImage.url
                }
            },
            {new: true}
        ).select("-password")

        return res.status(200).json(
            new ApiResponse(200, user, "Cover image updated successfully")
        )   
    })

})

export {registerUser, loginUser, logoutUser, refreshAccesToken, getCurrentUser, changeCurrentPassword, updateAccountDetails, updateUserAvatar, updateUserCoverImage};