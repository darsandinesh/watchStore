const express = require('express')
// const session = require('express-session')
const user = require('../controller/user_controller/userController')
const product = require('../controller/user_controller/userProduct')
const userRegisteration = require('../controller/user_controller/userRegisteration')
const cartController = require('../controller/user_controller/cartController')
const profile = require('../controller/user_controller/userProfileController')
const order = require('../controller/user_controller/orderController')
const onlinePayment = require('../controller/user_controller/onlinePayment')
const coupon = require('../controller/user_controller/couponController')
const { route } = require('./adminRoute')
const router = express.Router()

// to go to the home page of the ecom website
router.get('/', user.home)

// user singn up page whit validation
router.get('/login', user.login)
router.post('/login', user.validateUser)

// user registeration and orp verification, mail sending to the gamil of the use
router.get('/user-register', userRegisteration.user_register)
router.post('/user-register', userRegisteration.registerUser)
router.get('/user-reset-password', user.reset_password)
router.post('/otp_verification', userRegisteration.otpVerification)

router.get('/reset_otp_verification', userRegisteration.reset_otp_verification)
router.post('/reset_otp_verification', userRegisteration.resetotpVerification)

// for setting the new password for the user
router.get('/user-reset-password', userRegisteration.otpPage)
router.get('/otp_verification', user.passresetverification)
router.post('/user-reset-password', userRegisteration.resetotpv)
router.get('/reset-password', user.reset_password_get)
router.post('/reset-password', user.newpass)

// router to resend the otp when time experies
router.get('/resendotp', userRegisteration.resendotp)

// logout 
router.get('/signout', user.signout)

// rendering home page 
router.get('/home', product.homeData)

// showing all the product based on the category
router.get('/allproducts', product.allproductData)
router.get('/catproducts/:id', product.catProduct)
// router.get('/menproducts', user.checkUser, product.menproductData)
// router.get('/womenproducts', user.checkUser, product.womenproductData)
router.get('/pagination', product.catProduct)

//showing the detailed page of one perticular product 
router.get('/productDetails/:id', product.productData)


// sorting the product based on the price
router.get('/lowHigh', product.lowtohigh)
router.get('/highLow', product.hightolow)

// pagenations 
// router.get('/previous',product.previous)

// search product 
router.get('/searchProduct', product.search)

// cart datas below
router.get('/cart', user.checkUser, cartController.viewCart)

// add item to the cart
router.get('/add-to-cart/:id', user.checkUser, cartController.addtoCart)

// delete items form the cart
router.get('/delete-item-cart/:id', user.checkUser, cartController.deleteCart)

// change the quentity of the product when going to the checkout
router.post('/change-quentity', user.checkUser, cartController.changeQuantity)

router.get('/increaseQuantity/:id', user.checkUser, cartController.increment)
router.get('/decreaseQuantity/:id', user.checkUser, cartController.decrement)

// check out page 
router.post('/checkout', user.checkUser, order.proceedtoCheckOut)

// to fetch data from backend and diplay it in checkout page addreess
router.post('/displayaddress', user.checkUser, order.displayaddress)
// to payment page
router.post('/to-payment', user.checkUser, order.toPayment)
router.post('/onlinePayment', user.checkUser, onlinePayment.onlinePayment)
router.post('/placeOrder', onlinePayment.call)

// coupon management
router.post('/couponCheck',user.checkUser,coupon.couponCheck)
// coupon remove

router.post('/removeCoupon',user.checkUser,coupon.removeCoupon)
// router.post('/createOrder',onlinePayment.ajaxCall)
router.get('/api/payment/verify', user.checkUser, onlinePayment.razaroPayCall)
router.get('/paymentSuccess', user.checkUser, order.codPayment)
// online create order razaroPay
router.post('/createOrder', user.checkUser, onlinePayment.createOrder)
router.get('/onlinePayment', user.checkUser, order.order123)

router.get('/placedOrder', user.checkUser, order.placedOrders)


// wish list
router.get('/wishlist', user.checkUser, cartController.viewWish)
router.get('/wishlist/:id', user.checkUser, cartController.addtoWishList)
router.get('/delete-wishlist/:id', user.checkUser, cartController.removeWishlist)

// user account all the details of the user
router.get('/useraccount/:id', user.checkUser, user.userAccount)

router.get('/changePassword', user.checkUser, profile.changePass)

router.post('/changePassword', user.checkUser, profile.change)

router.post('/newPassword', user.checkUser, profile.newPassword)

router.post('/newAddress', user.checkUser, user.newAddress)


// history of the order 
router.get('/orderhistory', user.checkUser, order.orderData)
router.get('/orderHistoryPage/:id', user.checkUser, order.showDetailOrderHistory)
router.get('/historyOrder', user.checkUser, order.orderHistory)

//return reason
router.post("/returnreason/:id",user.checkUser,order.returnreason)


// cancell the order made by the user 
router.get('/cancelProduct', user.checkUser, order.cancelPro)

// return the product
router.get('/returnProduct/:id', user.checkUser, order.returnPro)

// address of the primary address of the user looged in
router.get('/add-address', user.checkUser, profile.profile)
router.get('/newAddressEdit', user.checkUser, profile.newAddressEdit)
router.post('/newAddressEdit', user.checkUser,profile.newAddress)

router.post('/add-address', user.checkUser, profile.addAddress)

// remove address of the user 
router.get('/removeAddress',user.checkUser,profile.removeAddress)

//update address 
router.get('/update-profile', user.checkUser, profile.updateProfile)

router.post('/update-profile', user.checkUser, profile.updateProfileData)

router.get('/error',user.errorPage)










// router.get('/AZ-sort/:id', user.azSort)
router.get('/zoom/:path', (req, res) => {
    console.log(req.params.path)
})


module.exports = router