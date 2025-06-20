//  if an async route handler throws an error (like when using await), 
// it doesn't automatically go to your error middleware unless you catch
//  and forward the error. asyncHandler helps by catching those errors for you.


const asyncHandler= (fn)=> async(req,res,next)=>{
    try{
        await fn(req, res, next)
    }catch(error){
        res.status(error.code || 500).json({   //Sets the HTTP status code to:error.code if it's defined (maybe something like 400, 404)
                                               // Otherwise, defaults to 500 (Internal Server Error)
           
        success:false, //sends json response as false
            message: error.message // sends a json response of error description
        })
    }

}


export {asyncHandler}