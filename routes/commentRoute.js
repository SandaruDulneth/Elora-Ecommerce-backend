import express from "express"
import { deleteComment, getComment, saveComment } from '../controllers/commentController.js';

const commentRouter = express.Router();

commentRouter.post("/",saveComment);
commentRouter.get("/",getComment);
commentRouter.delete("/",deleteComment);

export default commentRouter;