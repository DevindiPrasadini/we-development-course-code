import Order from "../models/order.js";
import Product from "../models/product.js"
import transporter from "../utils/mailer.js";

export default async function createOrder(req,res){
    const user = req.user

    if (user == null){
        res.status(401).json({
            message : "You need to be logged in to place an order"
        })
        return
    }

    const orderData = {
        orderId : "ORD00000001",
        email : user.email,
        firstName :user.firstName,
        lastName : user.lastName,
        addressLineOne : req.body.addressLineOne,
        addressLineTwo : req.body.addressLineTwo,
        city : req.body.city,
        state :req.body.state,
        postalCode : req.body.postalCode,
        phone : req.body.phone,
        total : 0,
        date : new Date().toISOString(),
        items : []
        
    }

    if(req.body.firstName != null && req.body.firstName !=""){
        orderData.firstName = req.body.firstName
    }
    if(req.body.lastName != null && req.body.lastName !=""){
        orderData.lastName = req.body.lastName
    }


    try{
        const lastOrder = await Order.findOne().sort({date: -1})

        if(lastOrder != null){
            const lastOrderIdString = lastOrder.orderId

            const lastOrderNumberInString = lastOrderIdString.replace("ORD", "")
            const lastOrderNumber = parseInt(lastOrderNumberInString)
            const newOrderNumber = lastOrderNumber +1
            const newOrderNumberInString = newOrderNumber.toString().padStart(8,"0")
            orderData.orderId = "ORD"+ newOrderNumberInString

        }

        for (let i=0; i<req.body.items.length ; i++){

            const product = await Product.findOne({productId : req.body.items[i].productId})

            if (product == null || !product.isAvailable || product.stock < req.body.items[i].quantity){
                res.status(400).json({
                    message : "product with productId "+ req.body.items[i].productId + "not found. please place your order without this product"
                })
                return
            }else{
                orderData.items.push({
                    product : {
                        productId : product.productId,
                        name : product.name,
                        price : product.price,
                        labelledPrice : product.labelledPrice,
                        image: product.images[0]
                    },
                    quantity : req.body.items[i].quantity

                })
                orderData.total += product.price * req.body.items[i].quantity
            }
        }

        const newOrder =  new Order(orderData)
        await newOrder.save()

        for(let i=0; i < orderData.items.length ; i++){
            await Product.findOneAndUpdate(
                {productId : orderData.items[i].product.productId},
                { $inc : {stock : -orderData.items[i].quantity}}
            )
        }

        res.status(201).json({
            message : "order placed successfully"
        })

    }catch(error){
        console.log(error)
        res.status(500).json({
            message : "Error creating order"
        })

    }
}

export async function getOrders(req,res){

    try{
        if(req.user == null){
            res.status(401).json({
                message : "you need to be logged in to view your orders"
            })
            return
        }

        const pageSizeInString = req.params.pageSize|| "10"
        const pageNumberInString = req.params.pageNumber|| "1"

        const pageSize = parseInt(pageSizeInString)
        const pageNumber = parseInt(pageNumberInString)

        if(pageSize < 1 || pageSize >100){
            res.status(400).json({
                message : "pagesize should be between 1 and 100"
            })
            return
        }

        if(req.user.isAdmin){
            const orderCount = await Order.countDocuments()
            const totalPages = Math.ceil(orderCount / pageSize)
            const orders = await Order.find().sort({date: -1}).skip((pageNumber-1) * pageSize).limit(pageSize)

            res.status(200).json({
                orders : orders,
                totalPages : totalPages,
                total : orderCount
            })
        }else{
            const orderCount = await Order.countDocuments({email:req.user.email})
            const totalPages = Math.ceil(orderCount / pageSize)
            const orders = await Order.find({email : req.user.email}).sort({date: -1}).skip((pageNumber-1) * pageSize).limit(pageSize)

            res.status(200).json({
                orders : orders,
                totalPages : totalPages,
                total : orderCount
            })
        }

    }catch(error){
        console.log(error)
        res.status(500).json({
            message : "error fetching orders"
        })
    }
}

export async function updateOrderStatusAndNotes(req,res){

    if(req.user && req.user.isAdmin){
        try{
            const orderId = req.params.orderId

            const existingOrder = await Order.findOne({ orderId: orderId })
            if (!existingOrder) {
                res.status(404).json({ message: "Order not found" })
                return
            }
            const statusChanged = req.body.status && req.body.status !== existingOrder.status

            await Order.findOneAndUpdate(
                { orderId : orderId},
                { status : req.body.status, notes : req.body.notes},
                { returnDocument : 'after'}
            )

            res.json({
                message : "order updated successfully"
            })

            if (statusChanged) {
                const message = {
                    from: process.env.GMAIL,
                    to: existingOrder.email,
                    subject: `Your order ${orderId} is now ${req.body.status} - I COMPUTERS`,
                    text: `Hi ${existingOrder.firstName},\n\nYour order ${orderId} status has been updated to: ${req.body.status}.\n\nThank you for shopping with I COMPUTERS.`
                }
                transporter.sendMail(message, (error, info) => {
                    if (error) {
                        console.log("Failed to send order status email:", error)
                    } else {
                        console.log("Order status email sent:", info.response)
                    }
                })
            }

        }catch(error){
            console.log(error)
            res.status(500).json({
                message : "error updating order status and notes"
            })
        }
    }else{
        res.status(403).json({
            message : "you are not authorized to perform this acton"
        })
    }
}

// export async function getSalesStats(req, res) {
//     try {
//         const stats = await Order.aggregate([
//             { $unwind: "$items" },
//             {
//                 $group: {
//                     _id: "$items.product.productId",
//                     unitsSold: { $sum: "$items.quantity" }
//                 }
//             }
//         ])
//         const statsMap = {}
//         stats.forEach(s => {
//             statsMap[s._id] = s.unitsSold
//         })
//         res.json(statsMap)
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ message: "Error fetching sales stats" })
//     }
// }

// customer can cancel their own order only while it's still Pending

export async function getSalesStats(req, res) {
    try {
        const stats = await Order.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product.productId",
                    unitsSold: { $sum: "$items.quantity" }
                }
            }
        ])
        const statsMap = {}
        stats.forEach(s => {
            statsMap[s._id] = s.unitsSold
        })
        res.json(statsMap)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching sales stats" })
    }
}

export async function cancelOrder(req, res) {
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" })
        return
    }
    try {
        const order = await Order.findOne({ orderId: req.params.orderId })

        if (!order) {
            res.status(404).json({ message: "Order not found" })
            return
        }

        if (order.email !== req.user.email && !req.user.isAdmin) {
            res.status(403).json({ message: "You can only cancel your own order" })
            return
        }

        if (order.status !== "Pending") {
            res.status(400).json({ message: "Only pending orders can be cancelled" })
            return
        }

        order.status = "Cancelled"
        await order.save()

        // restore stock for cancelled items
        for (let i = 0; i < order.items.length; i++) {
            await Product.findOneAndUpdate(
                { productId: order.items[i].product.productId },
                { $inc: { stock: order.items[i].quantity } }
            )
        }

        res.json({ message: "Order cancelled successfully" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error cancelling order" })
    }
}