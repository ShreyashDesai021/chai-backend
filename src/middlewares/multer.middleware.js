// src/middlewares/multer.middleware.js

import multer from "multer"; // multer is a middleware for handling multipart/form-data, which is primarily used for uploading files. It makes it easy to handle file uploads in Express applications.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {  //req is the request object, file is the file object that contains information about the uploaded file, cb is the callback function that is used to specify the destination and filename for the uploaded file
      cb(null, "./public/temp") // this is the directory where the uploaded files will be stored on the server, we will later use this file to upload it to cloudinary and then delete it from our local server, this is a temporary storage location for the uploaded files before they are uploaded to cloudinary
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname) // this is the name of the file that will be stored on the server, we are using the original name of the file that was uploaded by the user, but we can also modify the filename if we want to, for example, we can add a timestamp to the filename to make it unique, this is useful to prevent overwriting of files with the same name and also to make it easier to identify the files later on when we want to upload them to cloudinary or delete them from our local server
    }
  })
  
export const upload = multer({ 
    storage, 
}); // we are using multer.diskStorage() to specify the storage location and filename for the uploaded files. The destination function specifies the directory where the uploaded files will be stored, in this case, it is "./public/temp". The filename function specifies the name of the file that will be stored on the server, in this case, we are using the original name of the file that was uploaded by the user. We can also modify the filename if we want to, for example, we can add a timestamp to the filename to make it unique.