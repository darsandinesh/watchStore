const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const catDetails = require('../../model/categoryModel')
const userPro = require('../../model/userAddressModel')
const order = require('../../model/orderModel')
const cart = require('../../model/cartModel')
const sndmail = require('./generateotp')
const wish = require('../../model/wishlistModel')
const bcrypt = require('bcrypt')
const sharp = require('sharp');
const session = require('express-session');
const Razorpay = require('razorpay')
require('dotenv').config();



// payment gateway intagration razaropay
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_YOUR_KEY_ID,
    key_secret: process.env.RAZORPAY_YOUR_KEY_SECRET,
});

const createOrder = async (req, res) => {
    console.log('-------------------------------------------')
    console.log('body:', req.body);
    try {
        // const amount = req.body.amount * 100
        console.log('1')
        const userData = await cart.find({ username: req.body.username })
        console.log('2')
        const totalValue = await cart.aggregate([
            {
                $match: { username: req.body.username }
            },
            {
                $group: {
                    _id: '$product',
                    totalPrice: { $sum: '$price' },
                    totalQuantity: { $sum: '$quentity' }
                }
            },
            {
                $project: {
                    _id: 1,
                    amount: {
                        $multiply: ['$totalPrice', '$totalQuantity']
                    }
                }
            },
            {
                $group: {
                    _id: '',
                    sum: {
                        $sum: '$amount'
                    }
                }
            }
        ])
        const amount = totalValue[0].sum
        console.log('3')
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: 'razorUser@gmail.com'
        }
        console.log('4')

        instance.orders.create(options,
            (err, order) => {
                console.log('6')
                console.log(err)
                console.log(order)
                if (!err) {
                    console.log('5')

                    res.status(200).send({
                        success: true,
                        msg: 'Order Created',
                        order_id: order.id,
                        amount: totalValue,
                        key_id: process.env.RAZORPAY_YOUR_KEY_ID,
                        product_name: req.body.name,
                        // description: req.body.description,
                        // contact: "8567345632",
                        // name: "Sandeep Sharma",
                        // email: "sandeep@gmail.com"
                    });
                }
                else {
                    res.status(400).send({ success: false, msg: 'Something went wrong!' });
                }
            }
        );

    } catch (error) {
        console.log(error.message);
    }
}

const onlinePayment = (req, res) => {
    try {
        var options = {
            amount: 50000,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11"
        };
        instance.orders.create(options, function (err, order) {
            console.log(order);
            res.send({ orderId: 'dsfno23284y23jd332yrfowr' })
        });
    } catch (e) {
        console.log('error in thr onlinePayment function in the onlinePayment constroller in user side:' + e)
    }
}

const razaroPayCall = () => {
    try {
        var { validatePaymentVerification, validateWebhookSignature } = require('./dist/utils/razorpay-utils');
        validatePaymentVerification({ "order_id": razorpayOrderId, "payment_id": razorpayPaymentId }, signature, secret);
    } catch (e) {
        console.log('error in the razaroPayCall in cosntroller in userside')
    }
}

const call = (req, res) => {
    try {
        console.log('call in onlinePayment --------------------------------------------')
        console.log(req.body)
    } catch (e) {
        console.log('call error in the onlinePaymetController : ' + e)
    }
}

const ajaxCall = (req, res) => {
    try {
        console.log('-----------------------------------------ajaxCall called')
        console.log(req.body)
    } catch (e) {
        console.log('error in the ajaxCall in onlinePayment Controller in user side : ' + e)
    }
}






module.exports = { onlinePayment, razaroPayCall, call, ajaxCall, createOrder }