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
        console.log(listData)
        const categoryFound = req.query.err

        // const listval = req.query.val
        // console.log(listval)
        res.render('admin_category', { listData, categoryFound })

    } catch (e) {
        console.log("error in the listCategory in admin side : " + e)
    }
}

const save_category = async (req, res) => {
    try {
        const categoryFound = await editCat.find({ name: req.body.category })
        if (categoryFound) {
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
        console.log("Error in the edit_catergory in admin side : " + e)
    }

}

const edit_category = async (req, res) => {
    try {
        console.log(req.body)
        await editCat.updateOne({ name: req.params.id }, { $set: { name: req.body.name } })
        await productDetails.updateMany({ category: req.params.id }, { $set: { category: req.body.name } })
        res.redirect('/admin/category')
    } catch (e) {
        console.log('error in the edit_category of adminController : ' + e)
    }
}

const delete_category = async (req, res) => {
    try {
        console.log(req.params.id)
        await editCat.deleteOne({ name: req.params.id })
        res.redirect('/admin/category')
    } catch (e) {
        console.log("error in the delete_category admin side : " + e)
    }
}

module.exports = {
    save_category,
    delete_category,
    listCategory,
    edit_category,
}