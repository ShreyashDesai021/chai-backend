// utils/asyncHandler.js:

// This file contains a utility function called asyncHandler that is used to handle asynchronous operations in Express route handlers. It is a common pattern to wrap asynchronous route handlers in a try-catch block to catch any errors that may occur during the execution of the asynchronous code. The asyncHandler function simplifies this process by automatically catching any errors and passing them to the next middleware, which can be an error-handling middleware.

// Async handler using Promise
const asyncHandler = (requestHandler) => {
    (req, res, next) => {
        Promise
        .resolve(requestHandler(req, res, next))
        .catch((error) => next(error))
    }
}




export {asyncHandler};

//How Higher Order Functions work in JavaScript?
// const asyncHandler = () => {}
// const asyncHandler = (fn) => () => {} 
// const asyncHandler = (fn) => async() => {}       

//Aysnc handler using try-catch block:
// const ayncHandler = (fn) => async(req,res,next) => {
//     try{
//         await fn(req,res,next);
//     }catch(error){
//         res.status(error.code || 500).json({
//             success : false,
//             message: error.message || "Internal Server Error"
//         })
//     }
// }