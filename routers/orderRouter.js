import express from "express"

import createOrder, {cancelOrder, getOrders, getSalesStats, updateOrderStatusAndNotes} from "../controllers/orderController.js"

const orderRouter = express.Router();

orderRouter.post("/",createOrder)
orderRouter.get("/:pageSize/:pageNumber", getOrders)
orderRouter.put("/:orderId/cancel", cancelOrder)
orderRouter.put("/:orderId", updateOrderStatusAndNotes)
orderRouter.get("/sales-stats", getSalesStats)

export default orderRouter;