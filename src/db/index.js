//db/index.js

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connectionInstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`); //mongoose.connect() gives a return object that we can store. We can use this object to check if the connection was successful or if there were any errors.
        console.log(`Connected to MongoDB successfully || DB HOST: ${connectionInstance.connection.host} `);
       // console.log(connectionInstance); // This will log the connection instance object, which contains details about the connection, such as the host, port, and database name. This can be useful for debugging and verifying that the connection was established successfully.
    }catch(error){
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with a failure code
                         //process is the reference to the current Node.js process. process.exit(1) will exit the process with a failure code (1). This is useful to indicate that the application failed to start due to a database connection error.
    }
}

export default connectDB;