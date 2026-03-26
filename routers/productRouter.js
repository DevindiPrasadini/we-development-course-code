import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/",getAllProducts)
productRouter.post("/",createProduct)
productRouter.delete("/:productId",deleteProduct)
productRouter.put("/:productId",updateProduct)
productRouter.get("/:productId",getProductById)
//get req dekak eka laga tibbama uata eka run ven na param dal tiyen ev yatata dnn

export default productRouter;

