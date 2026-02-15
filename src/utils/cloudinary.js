// src/utils/cloudinary.js

// we will use two step process to upload our videos and images to cloudinary, using multer we wuill take the file from the user and store it on our local server , and then using cloudinary we will take that file from local server and upload it to cloudinary and get the url of the uploaded file from cloudinary and store that url in our database, and then we will delete the file from our local server after uploading it to cloudinary
// we use this two step process because since the file is on ur local server we can re-attempt file upload if the upload fails for some reason, and also we can perform some operations on the file before uploading it to cloudinary if we want to, for example we can compress the video file before uploading it to cloudinary to save storage space and reduce upload time

import {v2 as cloudinary} from "cloudinary";
import { log } from "console";
import fs from "fs"; // fs is a built-in module in Node.js that provides an API for interacting with the file system
                // we can use fs module to perform various file system operations such as reading, writing, deleting files and directories, etc. In our case, we will use the fs.unlink() method to delete the file from our local server after uploading it to cloudinary

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null; // if localFilePath is not provided, we will return null, this is useful when we want to upload a file that is optional, for example the cover image of a video is optional, so if the user does not provide a cover image, we can simply return null and handle it in our code accordingly
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto" // this option is used to automatically detect the type of the file being uploaded, it can be an image, video or any other type of file, this is useful when we want to upload different types of files without having to specify the resource type for each file    
        })
        // file has been uploaded successfully
        console.log("File uploaded successfully on cloudinary",response.url);
        return response; // we will return the url of the uploaded file from cloudinary, this url will be stored in our database and used to access the file from cloudinary in our frontend application
    }catch(error){
        fs.unlinkSync(localFilePath); // if there is an error while uploading the file to cloudinary, we will delete the file from our local server using fs.unlinkSync() method, this is useful to free up storage space on our local server and also to prevent any potential security issues that may arise from having unnecessary files on our server
        return null;
    }
}

export {uploadOnCloudinary};