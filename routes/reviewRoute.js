import express from 'express'
import { getReview, saveReview, updateReview } from '../controllers/reviewController.js';


const reviewRoute = express.Router();

reviewRoute.get("/",getReview);
reviewRoute.post("/",saveReview);
reviewRoute.put("/",updateReview)

export default reviewRoute;