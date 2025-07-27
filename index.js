import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRoute.js';
import userRouter from './routes/userRoute.js';
import jwt from 'jsonwebtoken';
import orderRouter from './routes/orderRoute.js';
import cors from 'cors';
import dotenv from 'dotenv';
import reviewRoute from './routes/reviewRoute.js';
import { updateReview } from './controllers/reviewController.js';
import commentRouter from './routes/commentRoute.js';

dotenv.config();
const app = express();
app.use(cors())
app.use(bodyParser.json())

app.use(
    (req,res,next)=>{
        const tokenString = req.header("Authorization")
        if(tokenString != null){
            const token = tokenString.replace("Bearer ", "")

            jwt.verify(token, "nimna", 
                (err,decoded)=>{
                    if(decoded != null){
                        req.user = decoded
                        next()
                    }else{
                        console.log("invalid token")
                        res.status(403).json({
                            message : "Invalid token"
                        })
                    }
                }
            )

        }else{
            next()
        }
    }
)

mongoose.connect("mongodb+srv://sandaru:1234@clusteralfa.c4vekd3.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAlfa")
.then(()=>{
    console.log("Connected to the database")
}).catch(()=>{
    console.log("Database connection failed")
})


app.use("/api/products", productRouter)
app.use("/api/users",userRouter)
app.use("/api/orders",orderRouter)
app.use("/api/reviews",reviewRoute)
app.use("/api/comments",commentRouter)



app.listen( 5000, 
    ()=>{
        console.log('Server is running on port 5000');
    }
)

