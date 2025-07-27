import Comment from "../models/comment.js";
import { isAdmin } from "./userController.js";

export async function getComment(req,res){
    try{
        if(isAdmin(req)){
            const comment = await Comment.find()
            res.json(comment)
        }else{
            res.status(403).json({
                message: "You are not authorized to view comments"
            })
        }
    }catch{
        res.json({
            message : "failed to get comments",
            error : err
        })
    }
}

export async function saveComment(req,res){

    if(req.user == null){
        res.status(403).json({
            message: "You need to sign in  to add a review"
        })
        return;
    }else{
        
        let newCommentID = "COMM00001";

        // Get the most recent review by reviewId (descending)
        const lastcomment = await Comment.find().sort({ commentId: -1 }).limit(1);

        if (lastcomment.length > 0) {
            const lastId = lastcomment[0].commentId; 
            const idNumber = parseInt(lastId.replace("COMM", "")); 
            const nextIdNumber = idNumber + 1;
            const paddedId = String(nextIdNumber).padStart(5, "0");
            newCommentID = "COMM" + paddedId; 
        }

        const comment = new Comment(
        {   commentId : newCommentID,
            firstName : req.body.firstname,
            lastName : req.body.lastName,
            email : req.body.email,
            phone : req.body.phone,
            comment : req.body.comment,
        }
        );

        comment.save().then(
            ()=>{
                res.json({
                    message : "Response submitted successfully"
                })
            }
        )
    }
}

export async function deleteComment(req,res){
    const commentId = req.body.commentId;
   
    if(req.user == null){
        res.status(403).json({
            message : "you need to sign in first to delete reviews !" 
        })
        return
    }
    
    try{
        const comment = await Comment.findOne({ commentId });
    if (req.user.email == comment.email || isAdmin(req)) {
      
          
            await Comment.deleteOne({
               commentId
            })

            res.json({
                message : "Comment deleted successfully"
            })
    
    }
    return res.status(403).json({
        message: "You can only delete your own Comment!"
    });
   
    }
    catch (err) {
        return res.status(500).json({
            message: "Failed to delete Comment",
            error: err.message
        });
    }
    
}