//  if an async route handler throws an error (like when using await), 
// it doesn't automatically go to your error middleware unless you catch
//  and forward the error. asyncHandler helps by catching those errors for you.


const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (error) {
    console.error("❌ Uncaught error:", error);

    const statusCode = (error.statusCode >= 100 && error.statusCode < 600)
      ? error.statusCode
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};





export {asyncHandler}