import { Router } from "express";
import { loginUser, logOutUser, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }])  ,       //since we want to accept multiple files thus we use fields....also chatgpt "why is fields a better option here instead of array"
    registerUser)

    router.route("/login").post(loginUser)


    // secured routes
    router.route("/logout").post(verifyJWT, logOutUser)  // after /logout is encountered the the verifyjwt function from auth.middleware.js gets executed then it passes the context to the logoutuser

export default router