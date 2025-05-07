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

export function saveReview(req,res){

    if(req.user == null){
        res.status(403).json({
            message: "You need to sign in  to add a review"
        })
        return;
    }else{
        const review = new Review(
            req.body
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