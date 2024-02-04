const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const orderData = require('../../model/orderModel')
const editCat = require('../../model/categoryModel')


const dashbord = async (req, res) => {
    try {
        const userCount = await userDetails.find({isAdmin:0}).count()
        const productCount = await productDetails.find({}).count()
        const orders = await orderData.distinct("orderId")
        const orderCount = orders.length
        
        res.render('admin_pannel' , {userCount,productCount,orderCount})
    } catch (e) {
        console.log("error in the dashbord of admin controller :" + e)
    }
}




const chartData= async (req, res) => {
    try {
        console.log('/chart-data calle')
        const monthAggregation = await orderData.aggregate([
            {
                $match: {
                    orderDate: { $exists: true }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$orderDate" },
                        month: { $month: "$orderDate" },
                        day: { $dayOfMonth: "$orderDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1,
                    "_id.day": 1
                }
            }
        ]);

        res.json(monthAggregation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    dashbord,
    chartData
}