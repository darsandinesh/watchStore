const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const catDetails = require('../../model/categoryModel')
const address = require('../../model/userAddressModel')
const sndmail = require('./generateotp')
const cart = require('../../model/cartModel')
const wish = require('../../model/wishlistModel')
const bcrypt = require('bcrypt')
const sharp = require('sharp');
const session = require('express-session');
require('dotenv').config();


const profile = async (req, res) => {
    try {
        const userin = req.session.userName
        const cartCount = await cart.find({ username: req.session.userName }).countDocuments()
        const wishCount = await wish.find({ username: userin }).countDocuments()
        res.render('user-Address', { cartCount, wishCount, userin })
    } catch (e) {
        console.log('error in the profile in userProfileController in the user side : ' + e)
        res.redirect("/error")
    }
}


const removeAddress = async(req,res)=>{
    try{
        const userin = req.session.userName
        await address.deleteOne({_id:req.query.userid})
        res.redirect(`/useraccount/${userin}`)
    }catch(e){
        console.log('error in the removeAddress in userProfileController in user side : '+e)
        res.redirect("/error")
    }
}
const newAddressEdit = async (req, res) => {
    try {
        const userin = req.session.userName
        const id = req.query.userid
        const userProfile = await address.findOne({ _id: id })
        const cartCount = await cart.find({ username: req.session.userName }).countDocuments()
        const wishCount = await wish.find({ username: userin }).countDocuments()
        res.render('user-Address-New', { cartCount, wishCount, userin, userProfile })
    } catch (e) {
        console.log('error in the profile in userProfileController in the user side : ' + e)
        res.redirect("/error")
    }
}


const newAddress = async (req, res) => {
    try {
        console.log(req.query.userid)
        const userin = req.session.userName
        console.log(req.body)
        const data = await address.findOne({ _id: req.query.userid })
        await address.updateOne({ _id: req.query.userid }, {
            address: {
                houseName: req.body.houseName,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                pincode: req.body.pincode
            },
            fullname: req.body.fullName,
            phone: req.body.phone,

        })
        console.log(data)
        res.redirect(`/useraccount/${userin}`)
    } catch (e) {
        console.log('error in the newAddress in userProfileController in user side:' + e)
        res.redirect("/error")
    }
}

const addAddress = async (req, res) => {
    try {
        console.log(req.session.userName)
        const username = req.session.userName

        console.log(req.body)
        const addressData = new address({
            username: req.session.userName,
            fullname: req.body.username,
            phone: req.body.phone,

            address: {
                houseName: req.body.house,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pin,
                country: req.body.country
            },
            primary: 1
        })

        await addressData.save()
        res.redirect(`/useraccount/${{ username }}`)
    } catch (e) {
        console.log('error in the addAddress in userProfileController in user side : ' + e)
        res.redirect("/error")
    }
}

const updateProfile = async (req, res) => {
    try {
        const userin = req.session.userName
        console.log('asdkfbask')
        console.log(userin)
        const userProfile = await address.findOne({ username: req.session.userName })
        console.log(userProfile)
        const cat = await catDetails.find({ list: 0 })
        const cartCount = await cart.find({ username: req.session.userName }).countDocuments()
        const wishCount = await wish.find({ username: userin }).countDocuments()
        res.render('user-Address', { userProfile, userin, cat, cartCount, wishCount })
    } catch (e) {
        console.log('error in the updateAddress in userprofilecontoller in user side : ' + e)
        res.redirect("/error")
    }
}

const updateProfileData = async (req, res) => {
    try {
        const userin = req.session.userName
        console.log(req.body)
        await address.updateOne({ username: userin }, {
            fullname: req.body.username,
            phone: req.body.phone,
            address: {
                houseName: req.body.house,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pin,
                country: req.body.country
            }
        })
        res.redirect(`/useraccount/${{ userin }}`)
    } catch (e) {
        console.log('error in the updateProfileData in userProfileController in user side : ' + e)
        res.redirect("/error")
    }
}

var otp
// set new password for the user form the user profile
const changePass = async (req, res) => {
    try {

        const userin = req.session.userName
        const val = req.query.val
        const cat = await catDetails.find({ list: 0 })
        const userData = await userDetails.findOne({ username: userin })
        //const otpData = sndmail.sendmail(userData.email)
        const cartCount = await cart.find({ username: req.session.userName }).countDocuments()
        const wishCount = await wish.find({ username: userin }).countDocuments()
        // otpData.then((val) => {
        //     console.log(val)
        //     otp = val[0]
        // })
        //console.log(otp)
        const error = req.query.error 
        res.render('changePass', { userin, val, cat, cartCount, wishCount,error })
    } catch (e) {
        console.log('error in the changePass in userController in user side : ' + e)
        res.redirect("/error")
    }
}


const change = async (req,res)=>{
    try{
        console.log(req.body);
        const userin = req.session.userName
        const userData = await userDetails.findOne({username:req.session.userName})
        const compare = await bcrypt.compare(req.body.password,userData.password)
        console.log(compare , userData)
        console.log('change function called')
        if(compare){
            const hashedpass = await bcrypt.hash(req.body.newpassword, 10)
            await userDetails.updateOne({ username: userin }, { $set: { password: hashedpass } })
            await req.session.destroy()
            res.redirect('/')
        }else{
            res.redirect('/changePassword?error=Enter your correct password')
        }
        

    }catch(e){
        console.log('error in the change in userController in user side : ' + e)
        res.redirect("/error")
    }
}

const newPassword = async (req, res) => {
    try {
        console.log(req.body)
        const userin = req.session.userName
        const hashedpass = await bcrypt.hash(req.body.newpass, 10)
        await userDetails.updateOne({ username: userin }, { $set: { password: hashedpass } })
        await req.session.destroy()
        res.redirect('/')
    } catch (e) {
        console.log('error in the newPassword in profileController in user side : ' + e)
        res.redirect("/error")
    }
}





module.exports = {
    addAddress,
    updateProfile,
    updateProfileData,
    changePass,
    change,
    newPassword,
    profile,
    newAddressEdit,
    newAddress,
    removeAddress,
}