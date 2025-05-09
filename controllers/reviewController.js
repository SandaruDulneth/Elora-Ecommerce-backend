import Review from "../models/review.js";
import { isAdmin } from "./userController.js";


export async function getReview(req,res){
    try{
        if(isAdmin(req)){
            const reviews = await Review.find()
            res.json(reviews)
        }else{
            res.status(403).json({
                message: "You are not authorized to view reviews"
            })
        }
    }catch{
        res.json({
            message : "failed to get reviews",
            error : err
        })
    }
}

export async function saveReview(req,res){

    if(req.user == null){
        res.status(403).json({
            message: "You need to sign in  to add a review"
        })
        return;
    }else{
        
 
        let newReviewID = "REV00001";

        // Get the most recent review by reviewId (descending)
        const lastReview = await Review.find().sort({ reviewId: -1 }).limit(1);

        if (lastReview.length > 0) {
            const lastId = lastReview[0].reviewId; 
            const idNumber = parseInt(lastId.replace("REV", "")); 
            const nextIdNumber = idNumber + 1;
            const paddedId = String(nextIdNumber).padStart(5, "0");
            newReviewID = "REV" + paddedId; 
        }

        const review = new Review(
        {   reviewId : newReviewID,
            usersName : req.user.firstName + "  " + req.user.lastName,
            email : req.user.email,
            comment : req.body.comment,
            rating : req.body.rating
        }
        );

        review.save().then(
            ()=>{
                res.json({
                    message : "Response submitted successfully"
                })
            }
        )
    }

}

export async function updateReview(req, res) {
    if (!req.user) {
        return res.status(403).json({
            message: "You need to sign in to edit a review"
        });
    }

    const { reviewId, comment, rating } = req.body;

    try {
        const review = await Review.findOne({ reviewId });

        if (!review) {
            return res.status(404).json({
                message: "No review found for this ID"
            });
        }

        if (req.user.email !== review.email) {
            return res.status(403).json({
                message: "You can only edit your own reviews!"
            });
        }

        await Review.updateOne(
          
            {
             comment: comment,
              rating: rating
            }
        );

        res.json({
            message: "Review updated successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: "Failed to update review",
            error: err.message
        });
    }
}


export async function deleteReview(req,res){
    const reviewId = req.body.reviewId;
   
    if(req.user == null){
        res.status(403).json({
            message : "you need to sign in first to delete reviews !" 
        })
        return
    }
    
    try{
        const review = await Review.findOne({ reviewId });
    if (req.user.email == review.email || isAdmin(req)) {
      
          
            await Review.deleteOne({
               reviewId
            })

            res.json({
                message : "Review deleted successfully"
            })
    
      
    }
    return res.status(403).json({
        message: "You can only delete your own reviews!"
    });
   
    }
    catch (err) {
        return res.status(500).json({
            message: "Failed to delete review",
            error: err.message
        });
    }
    
}

    
