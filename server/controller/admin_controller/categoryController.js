const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const config = require('../../../firebase.config')
const bcrypt = require('bcrypt')
const editCat = require('../../model/categoryModel')
const { connectStorageEmulator } = require('firebase/storage')


const listCategory = async (req, res) => {
    try {
        //const category = await productDetails.aggregate([ {$group:{ _id:"$category", count:{ $sum : 1 } } } ])
        const listData = await editCat.find({}).sort({ '_id': -1 })
        // console.log(listData)
        const categoryFound = req.query.err

        // const listval = req.query.val
        // console.log(listval)
        res.render('admin_category', { listData, categoryFound })

    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("error in the listCategory in admin side : " + e)
    }
}

const save_category = async (req, res) => {
    try {
        console.log(req.body.category)
        const categoryFound = await editCat.find({ name: { $regex: new RegExp(req.body.category, 'i') } })
        console.log(categoryFound)
        if (categoryFound.length > 0) {
            res.redirect('/admin/category?err=Category already exits')
        } else {
            if (req.body.category) {
                const catData = new editCat({
                    name: req.body.category,
                    list: 0,
                })
                await catData.save()
                res.redirect('/admin/category')
            } else {
                console.log("Error in the edit_category : catgeory is not getting!!! else part")
            }
        }

    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("Error in the edit_catergory in admin side : " + e)
    }

}

// edit the category of the product
const edit_category = async (req, res) => {
    try {
        console.log(req.body, req.body.name)
        const categoryFound = await editCat.find({ name: { $regex: new RegExp(`^${req.body.name}`, 'i') } });
        console.log(categoryFound, 'hai')
        if ((categoryFound.length == 0) || (categoryFound[0].name == req.body.oldname)) {
            console.log('1')
            await editCat.updateOne({ name: req.params.id }, { $set: { name: req.body.name, offer: req.body.offer } }, { upsert: true })
            console.log('2')
            await productDetails.updateMany({ category: req.params.id }, { $set: { category: req.body.name, catOffer: req.body.offer } }, { upsert: true })
            let discountAmount
            if (req.body.offer != '') {
                const productData = await productDetails.find({ category: req.params.id })
                for (let i = 0; i < productData.length; i++) {
                    if (productData[i].offer != '') {
                        console.log('if for if')
                        if (productData[i].offer > productData[i].catOffer) {
                            console.log('if for if if')
                            let sum = productData[i].price * productData[i].offer
                            let value = sum / 100
                            discountAmount = productData[i].price - value
                        } else {
                            console.log('else for if else')
                            let sum = productData[i].price * productData[i].catOffer
                            let value = sum / 100
                            discountAmount = productData[i].price - value
                        }

                    } else {
                        console.log('else for else')
                        let sum = productData[i].price * productData[i].catOffer
                        let value = sum / 100
                        discountAmount = productData[i].price - value
                    }
                    await productDetails.updateMany({ name: productData[i].name }, { $set: { discountAmount: discountAmount } }, { upsert: true })
                }

                console.log(productData, 'productDataaaa-----------aaaaaaa')
            } else {
                const productData = await productDetails.find({ category: req.params.id })
                for (let i = 0; i < productData.length; i++) {
                    if (productData[i].offer != '') {
                        console.log('else for if')
                        let sum = productData[i].price * productData[i].offer
                        let value = sum / 100
                        discountAmount = productData[i].price - value
                    } else {
                        console.log('else for else')
                        discountAmount = productData[i].price
                    }
                    await productDetails.updateMany({ name: productData[i].name }, { $set: { discountAmount: discountAmount } }, { upsert: true })
                }
                console.log(productData, 'productDataaaa-----------bbbbbbb')
            }

            res.redirect('/admin/category')

        } else {
            res.redirect('/admin/category?err=Category already exits')
        }
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log('error in the edit_category of adminController : ' + e)
    }
}

const delete_category = async (req, res) => {
    try {
        console.log(req.params.id)
        await editCat.deleteOne({ name: req.params.id })
        res.redirect('/admin/category')
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("error in the delete_category admin side : " + e)
    }
}

module.exports = {
    save_category,
    delete_category,
    listCategory,
    edit_category,
}