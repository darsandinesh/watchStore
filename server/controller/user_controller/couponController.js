const couponModel = require('../../model/couponModel')
const userDetails = require('../../model/userModel')
const cartModel = require('../../model/cartModel')

// validating the coupooon 
const couponCheck = async (req, res) => {
    try {
        const couponFound = await couponModel.findOne({ name: req.body.coupon })
        const couponUsed = await userDetails.findOne({ username: req.session.userName, coupon: { $in: `${req.body.coupon}` } })
        console.log(couponUsed)
        if (!couponUsed) {
            if (couponFound) {
                if (req.body.amount >= couponFound.minimumAmount) {
                    if (couponFound.expiry - new Date() >= 0) {
                        const username = req.session.userName
                        const data = await userDetails.updateOne({ username: username }, { $push: { coupon: couponFound.name } })
                        let discount = couponFound.discount
                        req.session.amountToPay = req.session.amountToPay - discount
                        let amount = req.session.amountToPay
                        console.log(amount, 'amount amount')
                        console.log(req.session.amountToPay)
                        req.session.coupon = req.body.coupon
                        //req.session.coupon = discount
                        res.json({ success: true, amount, discount })
                    } else {
                        let msg = 'In valid Coupon Code'
                        res.json({ success: false, msg })
                    }
                } else {
                    let msg = `Minimum amount to purcahse : ${couponFound.minimumAmount}`
                    res.json({ success: false, msg })
                }
            } else {
                let msg = 'In valid Coupon Code'
                res.json({ success: false, msg })
            }

        } else {
            let msg = 'You have already used'
            res.json({ success: false, msg })
        }

    } catch (e) {
        console.log('error in the couponCheck in userside in couponController.js:', e)
        res.redirect("/error")
    }
}



// remove the coupon after the coupon is applied 
const removeCoupon = async (req, res) => {
    try {
        console.log(req.body)
        const couponFound = await couponModel.findOne({ name: req.body.coupon })
        const username = req.session.userName
        const data = await userDetails.updateOne({ username: username }, { $pull: { coupon: couponFound.name } })
        req.session.coupon = false
        req.session.amountToPay = req.session.amountToPay + couponFound.discount
        let amount = req.session.amountToPay
        res.json({ success: true, amount })
    } catch (e) {
        console.log('error in the removeCoupon in the couponController in user side : ' + e)
        res.redirect("/error")
    }
}

// apply the wallet amount while buying the products
const applyWallet = async (req, res) => {
    try {
        console.log(req.body, '==============================================================')
        const userData = await userDetails.findOne({ username: req.session.userName })
        console.log(userData.wallet)
        let amount = Math.max(1, req.session.amountToPay - userData.wallet)
        let wallet = Math.max(0, userData.wallet - req.session.amountToPay)
        req.session.amountToPay = amount
        req.session.wallet = wallet
        req.session.reducedWallet = userData.wallet - wallet
        res.json({ success: true, amount, wallet })
    } catch (e) {
        console.log('error in the applyWallet in the couponController in user side : ' + e)
    }
}

// remove the wallet after applying
const removeWallet = (req, res) => {
    try {
        req.session.wallet = false
        let wallet = req.session.wallet + req.session.reducedWallet
        let amount = req.session.amountToPay + req.session.reducedWallet
        req.session.amountToPay = amount
        res.json({ success: true ,amount,wallet})
    } catch (e) {
        console.log('error in the removeWallet in couponControler in userside')
    }
}



module.exports = {
    couponCheck,
    removeCoupon,
    applyWallet,
    removeWallet,
}