import mongoose from "mongoose";

const CommentSchema = mongoose.Schema({
    commentId : {
        require : true,
        type : String,
        unique : true
    },

    firstName : {
        type : String,
        require : true
    },

    lastName: {
        type : String,
        require : true
    },

    email : {
        type : String,
        require : true
    },

    phone : {
        type : String,
        require : true
    },
    
    comment : {
        type : String,
        require : true
    },
})

const Comment = mongoose.model("comments", CommentSchema);

export default Comment;