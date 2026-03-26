import Product from "../models/product.js"
import isAdmin from "./userController.js"

export async function createProduct(req, res){

    if(!isAdmin(req)){
        res.status(403).json({
            message:"access denied.admins only"
        })
        return
    }

    /*if(req.user == null){//only admin can enter product so we check 
        res.status(401).json({
            message : "you need login first"
        })
        return
    }
        

    if(!req.user.isAdmin){
            res.status(403).json({
                message : " you dont have permission to perform this action"
            })
            return//!=not (user admin knk nemenm)
    }*/
    try{//eka id eken product dekak tiyed blnn oni
        //validation
        const existingProduct = await Product.findOne({
            productId : req.body.productId//user product ekak create krddi already e id tiye nm eyava hoyala denv
        })//ehema knk natnm null vatenv

        if(existingProduct!=null){
            res.status(400).json({
                message: " product with this productId already exist"
            })
            return//ehem tibbot function ek navattanv
        }

        const newProduct = new Product({
            productId: req.body.productId,
            name : req.body.name,
            altNames:req.body.altNames,
            price:req.body.price,
            labelPrice :req.body.labelPrice,
            description:req.body.description,
            images:req.body.images,
            brand : req.body.brand,
            model : req.body.model,
            category:req.body.category,
            stock:req.body.stock
        })

        await newProduct.save()

        res.status(201).json({ message :"product created successfully"})
        

    }catch(error){
        res.status(500).json({
            message : "error creating product"
        })

    }
}

export async function getAllProducts(req, res){
    try{
        if(isAdmin(req)){//admin knk visthara illanv nm
            const products = await Product.find()

        res.json(products)


        }else{//mormal knk illanvnm
            const products = await Product.find({isAvailable: true});
            res.json(products);
        }//available true aya hoynn
        
    }catch(error){
        res.status(500).json({
            message : "error fetching products"
        })

    }
}
export async function deleteProduct(req, res){
    if(!isAdmin(req)){//product delete krnn admin knkd kiyl blanav
        res.status(403).json({
            message : "access denied. admins only",
        });
        return
    }
    try{
        await Product.deleteOne({
            productId: req.params.productId//req eke parameter vl productId vidiht apu eka
        })
        res.json({
            message :  "product deleted successfully"
        })

    }catch(error){
        res.status(500).json({
            message : "error deleting product",
        })
    }
}

export async function updateProduct(req, res){
//update venn oni kavada kiyala denv
//postman eke localhost:3000/products/id eka
    if(!isAdmin(req)){
        res.status(403).json({
            message : "access denied. admins only",
        });
        return
    }
    try{
        await Product.updateOne({
            productId: req.params.productId
            

        },{
            name : req.body.name,
            altNames:req.body.altNames,
            price : req.body.price,
            labelPrice :req.body.labelPrice,
            description:req.body.description,
            images:req.body.images,
            brand : req.body.brand,
            model : req.body.model,
            category:req.body.category,
            stock:req.body.stock,
            isAvailable:req.body.isAvailable

        })

    }catch(error){
        res.status(500).json({
            message : "error updating product",
        });
    }
}
export async function getProductById(req, res) {
    try{
       const product = await Product.findOne({// e id eken product eka tiyed blnv
        productId: req.params.productId
       }) 
       if(product==null){
        res.status(400).json({//ntnm null kiyala yvnv
            message : "product not found"
        })
       }else{
        if(product.isAvailable){//tiye nm ona knkt blnn yavann
            res.json(product)
            
        }else{
            if(isAdmin(req)){
                res.json(product)
            }else{
                res.status(403).json({
                    message : "acess denied. admins only",
                })
            }
        }

       }
    }catch(error){
        res.status(500).json({
            message : "error fetching product",
        })
    }
    
}