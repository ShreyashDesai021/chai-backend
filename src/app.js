//src/app.js

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express(); // Create an instance of the Express application

//app.use() // this method is used for all middliewares and configurations

app.use(cors({ // Enable CORS for all routes and origins. This allows the server to accept requests from different origins, which is essential for frontend-backend communication in a web application.
    origin: process.env.CORS_ORIGIN,
    credentials: true, // This allows the server to accept cookies from the frontend, which is essential for maintaining user sessions and authentication.

})); 

app.use(express.json({ // This middleware is used to parse incoming JSON requests and make the data available in req.body. This is essential for handling API requests that send data in JSON format.
    limit : "16kb" // This middleware is used to parse incoming JSON requests and make the data available in req.body. The limit option is set to 16kb to prevent large payloads from overwhelming the server, which can help mitigate certain types of attacks and improve performance.    
})); 

//previously express was not able to take json files , we had to use body-parser middleware to parse json files but now express has a built-in middleware to parse json files so we don't need to use body-parser anymore.
// multer is used for file uploads, it is a middleware for handling multipart/form-data, which is primarily used for uploading files. It makes it easy to handle file uploads in Express applications.

app.use(express.urlencoded({ // This middleware is used to parse incoming requests with URL-encoded payloads, which is typically used for form submissions. It makes the data available in req.body. The limit option is set to 16kb to prevent large payloads from overwhelming the server.
    limit : "16kb",
    extended : true // The extended option allows for rich objects and arrays to be encoded into the URL-encoded format, which can be useful for handling complex form data. When set to true, it uses the qs library for parsing, which supports nested objects and arrays. When set to false, it uses the querystring library, which does not support nested objects and arrays.
}));

app.use(express.static("public")) // It is used to store files,folders like pdfs, images, videos etc. that can be accessed by the frontend. It serves static files from the specified directory. By default, it serves files from the "public" directory, but you can specify a different directory if needed.

app.use(cookieParser());
// This cookie-parser middleware is used to parse cookies in incoming requests and make them available in req.cookies. This is essential for handling user sessions and authentication, as cookies are often used to store session information on the client side.
// Using cookie-parser allows us to access cookies in the users browser and set cookies of the user browser. This is essential for maintaining user sessions and authentication, as cookies are often used to store session information on the client side.

// export default app; // Export the Express application instance as the default export
export { app }; // Export the Express application instance for use in other modules