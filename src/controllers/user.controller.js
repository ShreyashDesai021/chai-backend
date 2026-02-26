//src/controllers/user.controller.js

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save(validateBeforeSave = false) // we are setting validateBeforeSave to false because we don't want to run the validation again when we are saving the user after generating the refresh token, we just want to save the refresh token in the database without validating the other fields like email, username etc. because they are not being updated here, we are only updating the refresh token field

        return {accessToken, refreshToken}


    } catch (error) {
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

    if(!username || !email){
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

export {registerUser, loginUser, logoutUser};