const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const cartDetails = require('../../model/cartModel')
const catDetails = require('../../model/cartModel')
const wishDetails = require('../../model/wishlistModel')
const wish = require('../../model/wishlistModel')
// let alert = require('alert');
const sndmail = require('./generateotp')
const bcrypt = require('bcrypt')
const sharp = require('sharp');
const session = require('express-session');
const { response } = require('express')
require('dotenv').config();


const viewCart = async (req, res) => {
    try {
        const catData = await cartDetails.find({ username: req.session.userName })
        const catDataCount = await cartDetails.find({ username: req.session.userName }).countDocuments()
        // const proData = await productDetails.find({ name: catData.product })
        console.log('before type of')
        let totalPrice = 0
        if (catDataCount != 0) {
            const totalValue = await cartDetails.aggregate([
                {
                    $match: { username: req.session.userName }
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
            console.log(totalValue[0].sum)
            totalPrice = totalValue[0].sum
            // for (let i = 0; i < totalValue.length; i++) {
            //     console.log(totalValue[i].amount)
            //     totalPrice += totalValue[i].amount
            // }
        }
        req.session.totalCartPrice = totalPrice
        const userin = req.session.userName
        const cat = await catDetails.find({ list: 0 })
        res.render('product-cart', { catData, userin, catDataCount, totalPrice, cat })
    } catch (e) {
        console.log('error in the viewCart in cartController user side : ' + e)
    }
}


const addtoCart = async (req, res) => {
    try {
        console.log('api call')
        console.log(req.params.id)
        const cartPro = await productDetails.findOne({ name: req.params.id })
        console.log(cartPro)
        console.log(cartPro.imagePath[0])
        console.log(req.session.userName)
        const cartData = await cartDetails.findOne({ product: req.params.id })
        if (cartData) {
            console.log(cartData)
            let updatedValue = cartData.quentity
            console.log(updatedValue)
            console.log(typeof (updatedValue))
            updatedValue++
            await cartDetails.updateOne({ product: req.params.id }, { quentity: updatedValue })
        } else {
            const categoryData = new cartDetails({
                username: req.session.userName,
                product: cartPro.name,
                image: cartPro.imagePath[0],
                price: cartPro.price,
                quentity: 1
            })
            console.log('asfjgafs')
            console.log('++++++++++')

            await categoryData.save()
            console.log('----------------')
        }

        res.redirect('/cart')
    } catch (e) {
        console.log('error in the addtoCart in cartController user side : ' + e)
    }
}

const changeQuantity = async (req, res) => {
    try {
        const userin = req.session.userName
        console.log(req.body)
        const data = Object.values(req.body)
        console.log(data)
        const dataCart1 = await cartDetails.find({ $and: [{ username: userin }, { product: `${data[0]}` }] })


        // const catDataCount = await cartDetails.find({ username: req.session.userName }).countDocuments()

        console.log('before type of')
        let q = dataCart1[0].quentity
        console.log(q + Number(data[1]), 'quantity check 10')
        let val = q + Number(data[1])
        if ((val <= 10) & (val >= 1)) {
            await cartDetails.updateOne({ $and: [{ username: userin }, { product: `${data[0]}` }] }, { $inc: { quentity: req.body.count } })
            console.log('after cartupater')

            console.log('changeQuantity in cart controller in')
        }
        const totalValue = await cartDetails.aggregate([
            {
                $match: { username: req.session.userName }
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
        const dataCart = await cartDetails.find({ $and: [{ username: userin }, { product: `${data[0]}` }] })

        console.log(dataCart)
        let quantity = dataCart[0].quentity
        console.log(quantity, 'quantiity kiittyu')
        let totalPrice = Number(quantity) * Number(data[2])
        console.log(totalPrice)
        console.log(quantity, "quantity after updation")
        console.log(typeof (quantity), "quantity after updation")
        let totalAmount = totalValue[0].sum
        res.json({ response: true, totalPrice, quantity, totalAmount })

    } catch (e) {
        console.log('error in the changeQuantity in cartController in user side: ' + e)
    }
}

// incremet the quentity of the product in the cart

const increment = async (req, res) => {
    try {
        const cartData = await cartDetails.findOne({ product: req.params.id })
        let updatedValue = cartData.quentity
        updatedValue++
        await cartDetails.updateOne({ product: req.params.id }, { quentity: updatedValue })
        res.redirect('/cart')
    } catch (e) {
        console.log('error in the increment in cartController in userSide' + e)
    }
}
// decremet the quentity of the product in the cart
const decrement = async (req, res) => {
    try {
        const cartData = await cartDetails.findOne({ product: req.params.id })
        let updatedValue = cartData.quentity
        updatedValue--
        await cartDetails.updateOne({ product: req.params.id }, { quentity: updatedValue })
        res.redirect('/cart')
    } catch (e) {
        console.log('error in the decrement in cartController in userSide' + e)
    }
}

const deleteCart = async (req, res) => {
    try {
        console.log(req.params.id)
        await cartDetails.deleteOne({ product: req.params.id })
        res.redirect('/cart')
    } catch (e) {
        console.log('error in the deleteCart in cartController in user side : ' + e)
    }
}



const viewWish = async (req, res) => {
    try {
        const wishData = await wishDetails.find({ username: req.session.userName })
        // const proData = await productDetails.find({name:catData.product})
        const userin = req.session.userName
        const cat = await catDetails.find({ list: 0 })
        res.render('user-wish-list', { wishData, userin, cat })
    } catch (e) {
        console.log('error in the viewCart in cartController user side : ' + e)
    }
}

const addtoWishList = async (req, res) => {
    try {
        console.log(req.params.id)
        const wishPro = await productDetails.findOne({ name: req.params.id })
        const wishDataFound = await wishDetails.findOne({ product: req.params.id })
        console.log(wishDataFound)
        console.log(wishPro.imagePath[0])
        console.log(req.session.userName)
        if (!wishDataFound) {
            const wishData = new wishDetails({
                username: req.session.userName,
                product: wishPro.name,
                image: wishPro.imagePath[0],
                price: wishPro.price
            })
            console.log('asfjgafs')
            console.log('++++++++++')

            await wishData.save()
            console.log('----------------')
        }



        res.redirect('/wishlist')
    } catch (e) {
        console.log('error in the addtoCart in cartController user side : ' + e)
    }
}

const removeWishlist = async (req, res) => {
    try {
        const proName = req.params.id
        await wishDetails.deleteOne({ product: proName })
        res.redirect('/wishlist')
    } catch (e) {
        console.log('error in the removeWishlist in cartController in user side : ' + e)
    }
}

module.exports = {
    viewCart,
    addtoCart,
    addtoWishList,
    viewWish,
    deleteCart,
    changeQuantity,
    removeWishlist,
    increment,
    decrement,
}