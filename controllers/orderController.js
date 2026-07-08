import Order from "../models/order.js";
import Product from "../models/product.js"

export default async function createOrder(req,res){
    const user = req.user

    if (user == null){
        res.status(401).json({
            message : "You need to be logged in to place an order"
        })
        return
    }

    //let orderId = "ORD00000001"
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
        const lastOrder = await Order.findOne().sort({date: -1}) //get the last order

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

        //reduce stock products

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
        if(req.user == null){//admin knk nm okkom details denv
            res.status(401).json({
                message : "you need to be logged in to view your orders"
            })
            return
        }

        const pageSizeInString = req.params.pageSize|| "10"
    const pageNumberInString = req.params.pageNumber|| "1"

    const pageSize = parseInt(pageSizeInString)//convert to string
    const pageNumber = parseInt(pageNumberInString)

    if(pageSize < 1 || pageSize >100){
        res.status(400).json({
            message : "pagesize should be between 1 and 100"
        })
        return
    }



        if(req.user.isAdmin){
            const orderCount = await Order.countDocuments()//orders koccr tiyed kiyl pennv

            const totalPages = Math.ceil(orderCount / pageSize)
            //if user ask for 3 pg previous pages should skipped
            const orders = await Order.find().skip((pageNumber-1 )* pageSize).limit(pageSize)

            res.status(200).json({
                orders : orders,
                totalPages : totalPages,
                total : orderCount
            })
        }else{//user knk nm eyage order ek vitrk  pennv
            const orderCount = await Order.countDocuments({email:req.user.email})

            const orders = await Order.find({email : req.user.email})
            res.status(200).json(orders)

        }

    }catch(error){
        console.log(error)
        res.status(500).json({
            message : "error fetching orders"
        })
    }
}