import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
    productId : {//hama product ekakatama unique id ekak tiyenn oni
        type : String,
        required : true,
        unique : true
    },
    name :{
        type : String,
        required : true
    },
    altNames :{
        type : [String],//one product may have many alternative names
        required : false,
        default : []
    },
    price :{
        type : Number,
        required : true
    },
    labelPrice:{
        type : Number,
        required : true
    },
    images :{
        type:[String],//may have many images for 1 product
        required : true,
        default:["/images/default-product-01.png",
            "/images/default-product-02.png",
        ]
    },
    brand : {
        type :String,
        required : false
    },
    model : {
        type : String,
        required : false
    },
    category  : {
        type : String,
        required : true
    },
    isAvailable : {
        type :Boolean,
        required : true,
        default : true
    },
    stock : {
        type : Number,
        required : true,
        default :0
    },
    description: {
        type:String,
        required:false
    }
})
const Product = mongoose.model("Product",productSchema)
export default Product