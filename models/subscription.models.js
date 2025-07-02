import mongoose, { Schema } from "mongoose";

const subscriptionSchema= new Schema({

    subscriber:{
        type:Schema.Types.ObjectId,     //the one who subscribes
        ref: "User"
    },
    channel:{
         type:Schema.Types.ObjectId,
        ref: "User"                   //the one whom the subscriber subscibes to
    }

},
{
    timestamps:true
})

export const Subscription= mongoose.model("Subscription",subscriptionSchema)