import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { response } from "express";
import path from "path";
// import { checkPrime } from "crypto";
// import cookieParser from "cookie-parser";
// import { TokenExpiredError } from "jsonwebtoken";

const generateRefreshAndAccessToken=async(userId)=>{
  try{
     const user=await User.findById(userId)
    const accessToken= user.generateAccessToken()
    const refreshToken=user.generateRefreshToken()
   
    user.refreshToken=refreshToken
     await user.save({validateBeforeSave: false })

     return { refreshToken, accessToken}
    }
  catch(error){
    throw new ApiError(500,"something went wrong while generatinf access and referesh token")
  }
}



const registerUser=asyncHandler( async(req,res)=>{
     //get user detailes
     //validation-not empty
     //check if user already exists: username,email
     //check for images,check for avatar
     //upload them to cloudinary, avatar
     //create user object -create entry in db
     //remoove password and refreshtoken field from response
     //check for user creation
     //return res
      
     const{fullName, email, username, password}=req.body
      console.log("email: ",email);

      if (
        [fullName, email, username, password].some((field)=>
        
        field?.trim()=="")
        )
        {
            throw new ApiError(400,"all fields are compulsory")
        }
      
        const existedUser = await User.findOne({
         $or: [{ username }, { email }]
         });

         console.log("🔍 Checking existing user with:", { username, email });
        console.log("🔎 Found existing user:", existedUser);

        if(existedUser){
            throw new ApiError(409,"USER WITH EMAIL ALREADY EXISTS")
        }
       console.log("REQ.FILES:", req.files);

       const avatarLocalPath = path.resolve(req.files?.avatar?.[0]?.path);
        const coverImageLocalPath = path.resolve(req.files?.coverImage?.[0]?.path);
       
       console.log("✅ Avatar path (resolved):", avatarLocalPath);
      console.log("✅ Cover path (resolved):", coverImageLocalPath);

       if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
       }
        const avatar = await uploadOnCloudinary(avatarLocalPath);
       console.log("Cloudinary avatar response:", avatar);

     const coverImage = await uploadOnCloudinary(coverImageLocalPath);
     console.log("Cloudinary coverImage response:", coverImage);

  if (!avatar) {
  throw new ApiError(400, "Avatar upload failed");
}

        const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
       })

      const createdUser=await User.findById(user._id).select("-password -refreshToken")

       if(!createdUser)
       {
        throw new ApiError(500,"Something went wrong while registering the user")
       }
      return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered succesfully")
      )

    })  
 
    const loginUser=asyncHandler(async(req,res)=>
    {
    //  to do list------->
    //  req body
    //  username or email
    //  find the user
    // password check
    // access and refresh Token
    // send cookies 
    // response that user logged in
    const{email,username, password}= req.body
    if(!(username || email) ){
      throw new ApiError(400,"username or password is required")
    }
     const user= await User.findOne({
      $or: [{username},{email}]   //this method finds a user either by the refrence of username or email
     })
     if(!user){
      throw new ApiError(404,"user does not exist")
     }

    const isPasswordValid= await user.isPasswordCorrect(password)
      if(!isPasswordValid){
      throw new ApiError(404,"Invalid user credentials")
      }
       
     const{accessToken, refreshToken}=await generateRefreshAndAccessToken(user._id)
    
    const loggedInUser=await User.findById(user._id)
    .select("-password -refreshToken")
    
    const options={
      httpOnly: true,  //this makes sure the cookies are modifiable only from the server
      secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(

      new ApiResponse(
        200,
        {
          user:loggedInUser,accessToken,refreshToken //here the tokens are sent again because if the user wants to access the tokens for some reason so he can access them easily 
        },
        "User logged in successfully"
      )
    )


    })

    const logOutUser=asyncHandler(async(req,res)=>{
       // here we can use req.user._id bcz of the auth.middleware.js
    User.findByIdAndUpdate(req.user._id,    // to logout the user by finding the user and then we access the token it has
                                            //  and then make it undefined to remove access and thus logout the user
      {
        $set:{
          refreshToken:undefined
        }
      },{
        new:true
      }
    )
   const options={
      httpOnly: true,  //this makes sure the cookies are modifiable only from the server
      secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json( new ApiResponse (200,{},"User Logged Out"))
  
  
  })                                          

    // TODO:  <--------------refresh and acccess token usage -------->
// 1. when user registers, we generate access and refresh token
// 2. when user logs in, we generate access and refresh token
// 3. when user logs out, we clear the refresh token from the user and clear the cookies

// Where does this access token exist?
// It exists with the user in the form of cookies in their browser and is very short-lived

// so jab user ka session expire hoga to user ko refresh token ki zarurat padegi
// toh rather than telling the user to lgin again humlog user ka accesstoken ko refresh karenge 
// refresh karne ke liye humlog user ka token ko database mein saved token se compare karenge agar right hua toh usko ek naya access token de denge



const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changePassword= asyncHandler(async(req,res)=>{

const {oldPassword,newPassword}=req.body
 const user= await User.findById(req.user?._id)

 if(!user){
  throw new ApiError(404,"user does not exist")
 }

 const isMatching =user.isPasswordCorrect(oldPassword)

 if(!isMatching){
  throw new ApiError(400,"old password is incorrect")
 }
  
 user.password=newPassword
 await user.save({validateBeforeSave:false})

 return res
 .status(200)
 .json(
  new ApiResponse(
    200,
    {},
    "Password changed successfully"
  )
)
});

const changeAccountDetails= asyncHandler(async(req,res)=>
{
  const {email,fullName}=req.body
  if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});













export {registerUser,
  loginUser,logOutUser,
  refreshAccessToken,
  changePassword,
  changeAccountDetails  
}