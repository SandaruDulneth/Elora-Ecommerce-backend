import express from 'express'
import { getReview, saveReview } from '../controllers/reviewController.js';


const reviewRoute = express.Router();

reviewRoute.get("/",getReview);
reviewRoute.post("/",saveReview);

export default reviewRoute;