const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const config = require('../../../firebase.config')
const editCat = require('../../model/categoryModel')
const imageCon = require('../../controller/admin_controller/imageController')
const sharp = require('sharp')
const pathModule = require('path');
const bcrypt = require('bcrypt')

const path = require('path');

const fs = require('fs');

const addProduct = async (data, file) => {
    try {
        let filepath = [];
        for (let i = 0; i < file.length; i++) {
            let filePath = file[i].path.replace(/\\/g, '/').replace('public/', '/');
            filepath.push(filePath)
        }
        const { name, category, description, price, stock, about } = data;
        let amount = 0
        if (data.offer == '') {
            const catdata = await editCat.find({ name: category })
            if (catdata[0].offer == '') {
                amount = Number(data.discount)
            } else {
                let sum = Number(data.price) * Number(catdata[0].offer)
                let value = sum / 100
                amount = Number(data.price) - value
            }
        } else {
            const catdata = await editCat.find({ name: category })
            if (catdata[0].offer == '') {
                amount = Number(data.discount)
            } else {
                if (catdata[0].offer > data.offer) {
                    let sum = Number(data.price) * Number(catdata[0].offer)
                    let value = sum / 100
                    amount = Number(data.price) - value
                } else {
                    amount = Number(data.discount)
                }
            }
        }
        const productData = new productDetails({
            name: name,
            category: category,
            description: description,
            about: about,
            price: price,
            stock: stock,
            list: 0,
            display: 0,
            imagePath: filepath,
            offer: data.offer,
            discountAmount: amount
        });

        await productData.save();
        console.log('Product saved successfully.');
    } catch (e) {
        console.error('Error in the productController admin side:', e);
    }
};



const edit_product = async (body, file, id) => {
    try {
        console.log(body)
        console.log('edit_product image check------------------')
        console.log(file)
        let imagePath = []
        console.log('check for image is over+++++++++++')
        console.log(file, 'file file file file file file')
        if (file.length != 0) {

            for (let i = 0; i < file.length; i++) {

                imagePath[i] = file[i].path.replace(/\\/g, '/').replace('public/', '/')
                console.log(imagePath)
                await productDetails.updateOne(
                    { name: id },
                    { $set: { [`imagePath.${i}`]: imagePath[i] } }
                )
            }
        }

        console.log(body)
        const catdata = await editCat.find({ name: body.category })
        console.log(catdata,'-----------1-1--1-1-1-1-1--11-1---1--1-1-1---1--1-1----11--1')
        let offerPrice
        if (body.offer != '') {
            
            if (body.offer > catdata[0].offer) {
                let sum = Number(body.price) * Number(body.offer)
                let dis = sum / 100
                offerPrice = Number(body.price) - Math.floor(dis)
                console.log(body.offer, 'if')
            } else {
                let sum = Number(body.price) * Number(catdata[0].offer)
                let value = sum / 100
                offerPrice = Number(body.price) - value
            }

        } else {
            if (catdata[0].offer == '') {
                console.log('offer is null')
                offerPrice = Number(body.price)
            } else {
                console.log('offer is not null')
                let sum = Number(body.price) * Number(catdata[0].offer)
                let value = sum / 100
                offerPrice = Number(body.price) - value
                console.log(offerPrice,'offferprice - -- -- --')
            }
        }

        if (body) {
            await productDetails.updateOne({ name: id },
                {
                    $set: {
                        name: body.name,
                        category: body.category,
                        description: body.description,
                        about: body.about,
                        price: body.price,
                        stock: body.stock,
                        discountAmount: offerPrice,
                        offer: body.offer,
                    }
                },
                {
                    upsert: true
                })

            //res.redirect('/admin/products')
            return true;
        } else {
            
            console.log('data not retrived from edit_product route ')
            return false
        }
    } catch (e) {
        // res.redirect('/admin/errorPage')
        
        console.log('error in the edit_product of productController in admin : ' + e)
        return false
    }
}

const list_product = async (req, res) => {
    try {
        console.log(req.params.id)
        const productData = await productDetails.findOne({ name: req.params.id })
        let val = 1
        if (productData.display == 1)
            val = 0
        await productDetails.updateMany({ name: req.params.id }, { $set: { display: val } })
        res.redirect('/admin/products')
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("error in the list_product productController admin side : " + e)
    }
}

const productData = async (req, res) => {
    try {
        const products = await productDetails.find({}).sort({ '_id': -1 })
        const cat = await editCat.find({})
        // console.log(req.query.val)
        const product = req.query.product
        const update = req.query.update
        // console.log(products)
        if (products) {
            res.render('admin_product', { products, product, update, cat })
        } else {

            console.log("Error in admin productData product not found : ")
        }
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("Error in addmin productData : " + e)
    }
}

const editproduct = (req, res) => {
    res.render('admin_edit_product')
}

const updateProduct = async (req, res) => {
    try {
        console.log(req.params.id)
        const { updatename, updatecategory, updatedescription, updateprice, updatestock } = req.body
        console.log(req.body.updatename)
        const updatedata = await productDetails.updateOne({ name: req.params.id }, { name: updatename, category: updatecategory, description: updatedescription, price: updateprice, stock: updatestock })
        console.log(updatedata)
        res.redirect('/admin/products?update=product updated successfully')
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("Error in thr updateProduct of adminController : " + e)
    }
}

const add_products = async (req, res) => {
    try {
        const success = req.query.datasuccess
        const dataerror = req.query.dataerror
        const cat = await editCat.find({})
        console.log(cat)
        console.log('add_product router enter chythuu')
        res.render('admin_add_products', { success, dataerror, cat })
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("error in the add_products of admin cnotroller :" + e)
    }
}

const searchProduct = async (req, res) => {
    try {
        const nameSearch = req.body.search
        console.log(nameSearch)
        const regex = new RegExp(`${nameSearch}`, 'i')
        console.log(regex)
        const products = await productDetails.find({ name: { $regex: regex } })
        console.log(products)
        res.render('admin_product', { products, nameSearch })
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("catch of searchProduct in admin : " + e)
    }

}

module.exports = {
    addProduct,
    edit_product,
    list_product,
    productData,
    editproduct,
    updateProduct,
    add_products,
    searchProduct
}