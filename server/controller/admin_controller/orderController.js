const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const orderData = require('../../model/orderModel')
const editCat = require('../../model/categoryModel')

// used to disply the order details of the users
const orders = async (req, res) => {
    try {
        const dataOrder = await orderData.find({}).sort({ '_id': -1 })
        console.log(dataOrder)
        res.render('admin_orders', { dataOrder })
    } catch (e) {
        console.log("error in the oreders controller in admin side :" + e)
    }
}

// cancell the order made by the user bu admin
const deleteOrder = async (req, res) => {
    try {
        await orderData.updateOne({ $and: [{ orderId: req.query.orderId }, { product: req.query.product }] }, { $set: { adminCancell: 1, status: 'CANCELED' } })
        res.redirect('/admin/orders')
    } catch (e) {
        console.log('error in the deleteOrder in orderController in admin controller : ' + e)
    }
}

// to udate the status of the product 
const updateOrderStatus = async (req, res) => {
    try {
        console.log('---------------------------------------------------------------------')
        console.log(req.params.id)
        console.log(req.body.status)
        await orderData.updateOne(
            {
                $and: [{ orderId: req.query.orderId },
                { product: req.query.product }]
            },
            { $set: { status: req.body.status } }
        )


        res.redirect('/admin/orders')
    } catch (e) {
        console.log('error in the updateOrderStatus in orderController in admin side: ' + e)
    }
}

const searchOrder = async (req, res) => {
    try {
        let search = req.body.search
        console.log(search)
        const regex = new RegExp(`${search}`, 'i')
        const dataOrder = await orderData.find({ product: { $regex: regex } })
        res.render('admin_orders', { dataOrder })
    } catch (e) {
        console.log('error in the searchOrder in orderController in admin side : ' + e)
    }
}

const details = async (req, res) => {
    try {
        console.log(req.query.orderId)
        console.log(req.query.product)
        const data = await orderData.findOne({ $and: [{ orderId: req.query.orderId }, { product: req.query.product }] })
        // const img = await productDetails.findOne({ name: data.product })
        console.log(data)
        console.log('==================================================================')
        // console.log(img.imagePath[0])
        console.log('aidhgsai')
        res.render('admin_order_details', { data })
    } catch (e) {
        console.log('error in the details in orderController in adminSide : ' + e)
    }
}

module.exports = {
    updateOrderStatus,
    orders,
    deleteOrder,
    searchOrder,
    details,
}