
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"  //used to access and set cookies of a users browser from the server

const app=express()

app.use(cors({                         // Cross-Origin Resource Sharing (CORS) is used  allows web servers to specify which origins (domains) are permitted to access their resources, relaxing the same-origin policy which would otherwise block such requests. 
    credentials: true
}))


app.use(express.json({limit:"16kb"})) // for parsing application/json i.e receiveing data in json format
app.use(express.urlencoded({ extended: true, limit:"16kb" }))  // to get data from the url 
app.use(express.static("public"))   // to store miscelleanous files like photos,pdfs and other such assets for pubic access in a folder named public


app.use(cookieParser() )

export default {app}