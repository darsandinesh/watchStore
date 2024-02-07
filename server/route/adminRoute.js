const express = require('express')
// const session = require('express-session')
const adminCon = require('../controller/admin_controller/adminController')
const imagemanage = require('../controller/admin_controller/imageController')
const productmanage = require('../controller/admin_controller/productController')
const category = require('../controller/admin_controller/categoryController')
const orderData = require('../controller/admin_controller/orderController')
const dashAdmin = require('../controller/admin_controller/dashboard')
const coupon = require('../controller/admin_controller/couponController')
const router = express.Router()



router.get('/', adminCon.admin)

router.post('/', adminCon.checkAdmin)

router.get('/dashbord', adminCon.check, dashAdmin.dashbord)
router.get('/chart-data', adminCon.check, dashAdmin.chartData)
router.post('/salesReport', adminCon.check, orderData.salesReport)




// userDetails display
router.get('/userDetails', adminCon.check, adminCon.user)

router.post('/userDetails', adminCon.check, adminCon.searchUser)

router.get('/block/:username', adminCon.check, adminCon.block)




router.get('/products', adminCon.check, productmanage.productData)
//search products

router.post('/products', adminCon.check, productmanage.searchProduct)

router.get('/add_products', adminCon.check, productmanage.add_products)

router.post('/add_products', adminCon.check, imagemanage.imgUpload)

// router.post('/edit_products/:id', adminCon.check,productmanage.edit_product)
router.post('/edit_products/:id', adminCon.check, imagemanage.singleImage)


//edit product details
router.get('/edit_product/:id', adminCon.check, productmanage.editproduct)
//'admin_edit'
// router.post('/editproduct/:id', adminCon.updateProduct)

//delete product from the store

router.get('/deleteproduct/:id', adminCon.check, adminCon.deleteproduct)



// list the category of the products
router.get('/category', adminCon.check, category.listCategory)

router.post('/category', adminCon.check, category.save_category)

router.post('/editcat/:id', adminCon.check, category.edit_category)

router.get('/deletecat/:id', adminCon.check, category.delete_category)

// router.get('/add_category',adminCon.add_category)
router.get('/list/:id', adminCon.check, adminCon.list)

router.get('/delete/:id', adminCon.check, productmanage.list_product)

// order details of the user
router.get('/orders', adminCon.check, orderData.orders)
router.post('/updatestatus', adminCon.check, orderData.updateOrderStatus)
router.get('/deleteOrder', adminCon.check, orderData.deleteOrder)
router.get('/orderDetails', orderData.details)

//search order in admin pannel
router.post('/orders', adminCon.check, orderData.searchOrder)

router.get('/coupon', adminCon.check, adminCon.coupon)

router.post('/coupon', adminCon.check, coupon.addCoupon)

router.get('/removeCoupon', adminCon.check, coupon.removeCoupon)

router.post('/editCoupon', adminCon.check, coupon.editCoupon)


router.get('/add_coupon', adminCon.check, adminCon.add_coupon)

router.get('/orderpagination', adminCon.check, orderData.orderpagination)

//zoom images 



router.get('/logout', adminCon.logout)

module.exports = router