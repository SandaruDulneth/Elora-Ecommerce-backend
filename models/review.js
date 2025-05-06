import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
    reviewId : {
        require : true,
        type : String,
        unique : true
    },
    
    comment : {
        type : String,
        require : true
    },

    rating : {
        type : Number,
        require : true
    }
})
const Review = mongoose.model("reviews", reviewSchema);

export default Review;