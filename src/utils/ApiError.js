// src/utils/ApiError.js

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode;
        this.data = null // what is inside this.data? This is a property that can be used to store any additional data related to the error. For example, if there is a validation error, we can store the details of the validation error in this.data property. This can be useful for debugging and for providing more information to the client about the error.
        this.errors = errors;
        this.message = message;
        this.success = false;
        
        
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor); // This line captures the stack trace of the error and assigns it to the stack property of the error object. The first argument is the error object itself (this), and the second argument is the constructor function of the error (this.constructor). This allows us to get a stack trace that points to where the error was thrown in our code, which can be very helpful for debugging.
        }
    
    }

}

export {ApiError};