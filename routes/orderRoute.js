import express from "express";
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orderController.js";
const orderRouter = express.Router();

orderRouter.post("/",createOrder)
orderRouter.get("/",getOrders)
orderRouter.put("/:orderId/:status",updateOrderStatus) //those are the params  /:orderId/:status that we use through the ordercontroller



export default orderRouter;