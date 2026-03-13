//src/middlewares/auth.middleware.js
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from '../models/user.model.js';

export const verifyJWT = asyncHandler(async(req,res,next) => { // if res is unused then we can write _ instead of res, this is a convention to indicate that this parameter is not used in the function, it is just a placeholder to maintain the correct number of parameters in the function signature, we need to have three parameters (req, res, next) in the middleware function to be able to use it as a middleware in our routes, even if we are not using the res parameter in our middleware function, we still need to include it in the function signature to maintain the correct number of parameters and to be able to use this function as a middleware in our routes
try {
        const token = 
            req.cookies?.accessToken || 
            req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401,"Unauthorized, token is missing")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)    

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
        
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next()
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid Access Token")
}
})