const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const config = require('../../../firebase.config')
const bcrypt = require('bcrypt')
const editCat = require('../../model/categoryModel')
const couponModel = require('../../model/couponModel')

const addCoupon = async (req, res) => {
    try {
        console.log(req.body)
        const couponFound = await couponModel.find({ name: req.body.coupon })
        console.log(couponFound)
        if (req.body.discount < req.body.minAmount) {
            if (couponFound.length == 0) {
                const newCoupon = new couponModel({
                    name: req.body.coupon,
                    expiry: new Date(req.body.expiry),
                    discount: req.body.discount,
                    minimumAmount: req.body.minAmount,

                })
                await newCoupon.save()
                res.redirect('/admin/coupon?found= Coupon add successful')
            } else {
                res.redirect('/admin/coupon?found=Coupon Name Found')
            }
        } else {
            res.redirect('/admin/coupon?found=Discount amount should be less than minimum amount')
        }


    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log('error in the addCoupon in couponController in admin side: ' + e)
    }
}

const removeCoupon = async (req, res) => {
    try {
        await couponModel.deleteOne({ name: req.query.name })
        res.redirect('/admin/coupon?found=Coupon Removed')
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log('error in the removeCoupon in couponController in admin side:' + e)
    }
}

const editCoupon = async (req, res) => {
    try {
        console.log(req.query.name, 'req.query.name')
        console.log(req.body, '====================================')
        const couponFounde = await couponModel.findOne({ name: req.body.coupon })
        console.log(couponFounde)
        if (req.body.discount < req.body.minAmount) {
            if (!couponFounde || (req.body.oldcoupon == couponFounde.name)) {
                console.log('found')
                await couponModel.updateOne({ name: req.query.name }, {
                    name: req.body.coupon, expiry: new Date(req.body.expiry), discount: req.body.discount
                    , minimumAmount: req.body.minAmount
                })
                res.redirect('/admin/coupon?found= Coupon updated successful')
            } else {
                console.log('notfound')
                res.redirect('/admin/coupon?found=Coupon Found, try different coupon code')
            }
        } else {
            res.redirect('/admin/coupon?found=Discount amount should be less than minimum amount')
        }

    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log('error in the editCoupon in couponController in admin side : ' + e)
    }
}


module.exports = {
    addCoupon,
    removeCoupon,
    editCoupon
}