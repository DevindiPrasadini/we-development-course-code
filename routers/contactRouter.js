import express from "express"
import { createContactMessage, getContactMessages } from "../controllers/contactController.js"

const contactRouter = express.Router()

contactRouter.post("/", createContactMessage)
contactRouter.get("/", getContactMessages)

export default contactRouter