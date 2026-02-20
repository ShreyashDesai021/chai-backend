//src/routes/user.routes.js

// Major task of node.js is to handle when to run a method. The method should run when a url is hit.
// So for this we create seperate file for routes. This file will have all the routes related to user. We will import the controller method and use it in the route.

// How to make and export a router in express? // Chatgpt answer this

import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
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

export default router;

// Now we have created a router. We will import the controller method and use it in the route. We will also export the router. We will import this router in the main file and use it.