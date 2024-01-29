const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const config = require('../../../firebase.config')
const editCat = require('../../model/categoryModel')
const imageCon = require('../../controller/admin_controller/imageController')
const bcrypt = require('bcrypt')

const addProduct = async (data, file) => {
    // console.log(data)
    // console.log(file)
    let imgpath = []
    console.log(file)
    // filePath.replace(/\\/g, '/');
    try {
        for (let i = 0; i < file.length; i++) {
            imgpath[i] = file[i].path.replace(/\\/g, '/').replace('public/', '/')
        }
        const { name, category, description, price, stock, about } = data
        console.log(imgpath)
        const productData = new productDetails({
            name: name,
            category: category,
            description: description,
            about: about,
            price: price,
            stock: stock,
            list: 0,
            display: 0,
            imagePath: imgpath,
        })

        await productData.save()


    } catch (e) {
        console.log("error in the productController admin side : " + e)
    }
    // try {
    //     const path = res
    //     console.log(path)
    //     const { name, category, description, price, stock } = req
    //     console.log(name)

    //     // if both req.body and req.file exist
    //     if (req && res) {
    //         const productData = new productDetails({
    //             name: name,
    //             category: category,
    //             description: description,
    //             price: price,
    //             stock: stock,
    //             list: 0,
    //             imagePath: path,
    //         })
    //         await productData.save()
    //         // console.log("product added to the database suucess")
    //         console.log('File successfully uploaded.');
    //         // res.redirect('/admin/add_products?datasuccess=Product added successfully')
    //         console.log("product added to the database suucess")
    //         // res.redirect('/admin/add_products?datasuccess=Product added successfully')
    //     } else {
    //         // res.redirect('/admin/add_products?dataerror=Invalid product data')
    //     }
    // } catch (e) {
    //     console.log("Product Details product Controller error : " + e)
    //     // res.redirect('/admin/add_products?dataerror=Error adding product')
    // }
}

const edit_product = async (body, file, id) => {
    try {
        console.log(body)
        // console.log(req.params.id)
        console.log('edit_product image check------------------')
        console.log(file)
        // await imageCon.singleImage(req.body)

        console.log('check for image is over+++++++++++')
        if (file.length != 0) {
            let imagePath = []
            for (let i = 0; i < file.length; i++) {

                imagePath[i] = file[i].path.replace(/\\/g, '/').replace('public/', '/')
                console.log(imagePath)
                await productDetails.updateOne(
                    { name: id },
                    { $set: { [`imagePath.${i}`]: imagePath[i] } }
                )
            }
        }

        // console.log(await productDetails.find({name:id}))
        console.log(body)

        if (body) {
            await productDetails.updateOne({ name: id }, {
                $set: {
                    name: body.name,
                    category: body.category,
                    description: body.description,
                    about: body.about,
                    price: body.price,
                    stock: body.stock
                }
            })

            // res.redirect('/admin/products')
        } else {
            console.log('data not retrived from edit_product route ')
        }
    } catch (e) {
        console.log('error in the edit_product of productController in admin : ' + e)
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