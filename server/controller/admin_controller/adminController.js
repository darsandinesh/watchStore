const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const config = require('../../../firebase.config')
const bcrypt = require('bcrypt')
const editCat = require('../../model/categoryModel')
const couponModel = require('../../model/couponModel')


const check = (req, res, next) => {
    try {
        if (req.session.adminAuth) {
            next()
        } else {
            res.redirect('/admin')
        }
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log('error in the check in adminController in admin side : ' + e)
    }
}

const admin = (req, res) => {
    try {
        if (req.session.adminAuth) {
            res.redirect('/admin/dashbord')
        } else {
            console.log('admin login page render')
            const user = req.query.invaliduser
            const pass = req.query.invalidpass
            res.render('admin_login', { user, pass })
        }
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("error in the admin contreoller : " + e)
    }
}


const checkAdmin = async (req, res) => {
    try {
        const adminFound = await userDetails.findOne({ username: req.body.loginUsername })
        console.log(adminFound)
        if (adminFound.isAdmin == 1) {
            const passSuccess = await bcrypt.compare(req.body.loginPassword, adminFound.password)
            if (passSuccess) {
                req.session.adminAuth = true
                res.redirect('/admin/dashbord')
            } else {
                res.redirect('/admin?invalidpass=Invalid password')
            }
        } else {
            res.redirect('/admin?invaliduser=Invalid username')
        }
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("Error in the checkAdmin of admin controller : " + e)
    }
}

const user = async (req, res) => {
    try {
        const userData = await userDetails.find({ isAdmin: 0 }).sort({ '_id': -1 })
        console.log(userData)
        res.render('admin_userDetails', { userData })
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("catch of user in admin : " + e)
    }

}

const block = async (req, res) => {
    try {
        const name = req.params.username
        // console.log(name)
        const userData = await userDetails.findOne({ username: name })
        let val = 1
        if (userData.status == 1)
            val = 0
        await userDetails.updateOne({ username: name }, { $set: { status: val } })
        res.redirect('/admin/userDetails')
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("catch of block in admin : " + e)
    }

}

const searchUser = async (req, res) => {
    try {
        const nameSearch = req.body.search
        const regex = new RegExp(`${nameSearch}`, 'i')
        console.log(regex)
        const userData = await userDetails.find({ $and: [{ username: { $regex: regex } }, { isAdmin: 0 }] })
        res.render('admin_userDetails', { userData, nameSearch })
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("catch of searchUser in admin : " + e)
    }

}


const list = async (req, res) => {
    try {
        const name = req.params.id
        console.log(name)
        const productData = await editCat.findOne({ name: name })
        let val = 1
        if (productData.list == 1)
            val = 0
        await editCat.updateMany({ name: name }, { $set: { list: val } })
        await productDetails.updateMany({ category: name }, { $set: { list: val } })
        res.redirect(`/admin/category?val=${val}`)
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("catch of list in admin : " + e)
    }

}

// delete product from the database
const deleteproduct = async (req, res) => {
    try {
        const name = req.params.id
        await productDetails.deleteOne({ name: name })
        res.redirect('/admin/products?product=Deleted successfully')
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("Error in the asmin controller , deleteproduct : " + e)
    }
}

// const editproduct = async (req, res) => {
//     try {
//         const editData = await productDetails.findOne({ name: req.params.id })
//         // const {name, category, description, price, stock } = editData
//         res.render('admin_edit_product', { editData })
//     } catch (e) {
//         console.log("Eoor in the editproduct admin controller : " + e)
//     }
// }





const logout = async (req, res) => {
    try {
        await req.session.destroy()
        // req.session.adminAuth = false

        res.redirect('/admin')
    }
    catch (e) {
        res.redirect('/admin/errorPage')
        console.log("error in logout in admin controller!!! : " + e)
    }
}

const coupon = async (req, res) => {
    try {
        const couponData = await couponModel.find({})
        const couponFound = req.query.found
        console.log(couponData)
        res.render('admin_coupon', { couponData, couponFound })
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("error in the coupon controller in admin side :" + e)
    }
}


const add_coupon = (req, res) => {
    try {
        res.render('admin_add_coupon')
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("error in the add_coupon controller in admin side :" + e)
    }
}

const list_product = (req, res) => {

}

const offers = (req, res) => {
    try {
        res.render('admin_offers')
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log('error in the offers in the adminController in the admin side : ' + e)
    }
}

const errorPage = (req, res) => {
    try {
        res.render('adminErrorPage')
    } catch (e) {
        console.log('error in the error in the adminController in admin side : ' + e)
    }
}


module.exports = {
    user,
    block,
    checkAdmin,
    searchUser,
    list,
    deleteproduct,
    logout,
    admin,
    coupon,
    add_coupon,
    list_product,
    check,
    offers,
    errorPage,
}