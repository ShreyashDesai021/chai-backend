//src/routes/user.routes.js

// Major task of node.js is to handle when to run a method. The method should run when a url is hit.
// So for this we create seperate file for routes. This file will have all the routes related to user. We will import the controller method and use it in the route.

// How to make and export a router in express? // Chatgpt answer this

import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar", 
            maxCount: 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]), // accepts array
    registerUser);

router.route("/login").post(loginUser) 

//secured routes

router.route("/logout").post(verifyJWT, logoutUser) // thats why we wrote next() in the verifyJWT middleware, because we want to run the logoutUser controller method only after the verifyJWT middleware has verified the token and added the user to the request object, if we don't write next() in the verifyJWT middleware then the logoutUser controller method will never run because the verifyJWT middleware will not call next() and will not pass the control to the next middleware or controller method in the route, so we need to write next() in the verifyJWT middleware to pass the control to the next middleware or controller method in the route after it has done its job of verifying the token and adding the user to the request object.



export default router;

// Now we have created a router. We will import the controller method and use it in the route. We will also export the router. We will import this router in the main file and use it.