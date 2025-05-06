import Review from "../models/review.js";


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

    if(User.req==null){
        res.status(403).json({
            message: "You need to sign in  to add a review"
        })
    }else{
        
    }

}