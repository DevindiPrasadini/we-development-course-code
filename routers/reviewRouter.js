import express from "express"
import { createReview, getReviewForProduct, updateReview, deleteReview, getReviewStats, getAllReviews } from "../controllers/reviewController.js"

const reviewRouter = express.Router()

reviewRouter.post("/", createReview)
reviewRouter.get("/stats", getReviewStats)
reviewRouter.get("/product/:productId", getReviewForProduct)
reviewRouter.get("/:pageSize/:pageNumber", getAllReviews)
reviewRouter.put("/:id", updateReview)
reviewRouter.delete("/:id", deleteReview)

export default reviewRouter