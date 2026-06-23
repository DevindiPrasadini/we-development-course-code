import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    addressLineOne: { type: String, required: true },
    addressLineTwo: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true },
    status: { type: String, required: true, default: "Pending" },
    notes: { type: String },
    total: { type: Number, required: true, default: 0 },
    date: { type: String, required: true },
    items: [
        {
            product: {
                productId: { type: String, required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                labelledPrice: { type: String, required: true },
                image: { type: String },
            },
            quantity: { type: Number, required: true }
        }
    ]
});

const Order = mongoose.model("Order", orderSchema);
export default Order;