
// This code defines a custom error class called ApiError  It extends the 
// built-in Error class and allows for structured, 
// meaningful error responses.
class ApiError extends Error {
    constructor(
        statusCode,  
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message) //Calls the parent class Error's constructor
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {                 // If a custom stack trace is provided, use it.
                                     // Otherwise, use Error.captureStackTrace() to generate the normal stack trace (helps with debugging).
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}