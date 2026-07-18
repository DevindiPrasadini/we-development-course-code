import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
    productId: {
        type: String,
        
        required: true
    },
    userEmail: {
        type:String,
      
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating:{
        type: Number,
        required: true,
        min:1,
        max:5
    },
    comment: {
        type: String,
        default: ""
    },
    isAnonymous: {
        type: Boolean,
        default: false
    }

},{timestamps: true})

const Review = mongoose.model("Review", reviewSchema)
export default Review