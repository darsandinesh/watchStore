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
        if (couponFound.length == 0) {
            const newCoupon = new couponModel({
                name: req.body.coupon,
                expiry: new Date(req.body.expiry),
                discount: req.body.discount,
                minimumAmount: req.body.minAmount,

            })
            await newCoupon.save()
        res.redirect('/admin/coupon')
        }else{
            res.redirect('/admin/coupon?found=Coupon Name Found')
        }
        
    } catch (e) {
        console.log('error in the addCoupon in couponController in admin side: ' + e)
    }
}

const removeCoupon = async (req,res)=>{
    try{
        await couponModel.deleteOne({name:req.query.name})
        res.redirect('/admin/coupon?found=Coupon Removed')
    }catch(e){
        console.log('error in the removeCoupon in couponController in admin side:'+e)
    }
}

const editCoupon =async (req,res)=>{
    try{
        console.log(req.query.name,'req.query.name')
        console.log(req.body)
        await couponModel.updateOne({name:req.query.name},{name:req.body.coupon,expiry:new Date(req.body.expiry),discount:req.body.discount
        ,minimumAmount:req.body.minAmount})
        res.redirect('/admin/coupon')
    }catch(e){
        console.log('error in the editCoupon in couponController in admin side : '+e)
    }
}


module.exports = {
    addCoupon,
    removeCoupon,
    editCoupon
}