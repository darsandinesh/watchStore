const couponModel = require('../../model/couponModel')
const userDetails = require('../../model/userModel')



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
                        let amount = req.body.amount - couponFound.discount
                        let discount = couponFound.discount

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
        res.render('errorPage')
        console.log('error in the couponCheck in userside in couponController.js:', e)
        res.redirect("/error")
    }
}

const removeCoupon = async (req,res)=>{
    try{
        console.log(req.body)
        const couponFound = await couponModel.findOne({ name: req.body.coupon })
        const username = req.session.userName
        const data = await userDetails.updateOne({ username: username }, { $pull: { coupon: couponFound.name } })
        res.json({success:true})
    }catch(e){
        console.log('error in the removeCoupon in the couponController in user side : ' +e)
        res.redirect("/error")
    }
}


module.exports = {
    couponCheck,
    removeCoupon
}