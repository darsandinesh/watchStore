const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const orderData = require('../../model/orderModel')
const editCat = require('../../model/categoryModel')


const dashbord = async (req, res) => {
    try {
        const userCount = await userDetails.find({ isAdmin: 0 }).count()
        const productCount = await productDetails.find({}).count()
        const orders = await orderData.distinct("orderId")
        const orderStatusP = await orderData.aggregate([{ $match: { status: 'placed' } }, { $group: { _id: "$status", count: { $sum: 1 } } }])
        const orderStatusC = await orderData.aggregate([{ $match: { status: 'CANCELED' } }, { $group: { _id: "$status", count: { $sum: 1 } } }])
        const orderStatusD = await orderData.aggregate([{ $match: { status: 'Delivered Successfully' } }, { $group: { _id: "$status", count: { $sum: 1 } } }])
        const orderStatusO = await orderData.aggregate([{ $match: { status: 'Out for delivery' } }, { $group: { _id: "$status", count: { $sum: 1 } } }])
        let codPay = await orderData.find({}).count()
        const online = await orderData.find({ paymentMentod: 'Online' }).count()
        console.log(online)
        codPay = codPay - online
        console.log(codPay)
        const orderCount = orders.length

        res.render('admin_pannel', { userCount, productCount, orderCount, orderStatusP, orderStatusC, orderStatusD, orderStatusO, codPay, online })
    } catch (e) {
        console.log("error in the dashbord of admin controller :" + e)
    }
}




const chartData = async (req, res) => {
    try {
        console.log('/chart-data calle')
            const Aggregation = await orderData.aggregate([
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
        res.json(Aggregation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const chartDataMonth = async (req, res) => {
    try {
        console.log('/chart-data calle')
            const Aggregation = await orderData.aggregate([
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
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                        "_id.month": 1,
                    }
                }
            ]);
        res.json(Aggregation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const chartDataYear = async (req, res) => {
    try {
        console.log('/chart-data calle')
            const Aggregation = await orderData.aggregate([
                {
                    $match: {
                        orderDate: { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$orderDate" },
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        "_id.year": 1,
                    }
                }
            ]);
        res.json(Aggregation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



module.exports = {
    dashbord,
    chartData,
    chartDataMonth,
    chartDataYear
}