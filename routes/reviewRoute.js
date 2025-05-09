import express from 'express'
import { deleteReview, getReview, saveReview, updateReview } from '../controllers/reviewController.js';


const reviewRoute = express.Router();

reviewRoute.get("/",getReview);
reviewRoute.post("/",saveReview);
reviewRoute.put("/",updateReview);
reviewRoute.delete("/",deleteReview);

export default reviewRoute;