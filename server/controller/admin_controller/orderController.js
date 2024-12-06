const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const orderData = require('../../model/orderModel')
const editCat = require('../../model/categoryModel')
const fs = require("fs");
const os = require("os");
const path = require("path");
// const puppeteer = require("puppeteer");

// used to disply the order details of the users
const orders = async (req, res) => {
    try {
        const dataOrder = await orderData.find({}).sort({ '_id': -1 }).limit(5)
        console.log(dataOrder)
        let current = 0
        let displayprev = 0
        let displaynxt = 1
        res.render('admin_orders', { dataOrder, current, displayprev, displaynxt })
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log("error in the oreders controller in admin side :" + e)
    }
}

// cancell the order made by the user bu admin
const deleteOrder = async (req, res) => {
    try {
        await orderData.updateOne({ $and: [{ orderId: req.query.orderId }, { product: req.query.product }] }, { $set: { adminCancell: 1, status: 'CANCELED' } })
        res.redirect('/admin/orders')
    } catch (e) {
        res.redirect('/admin/errorPage')
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
        res.redirect('/admin/errorPage')
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
        res.redirect('/admin/errorPage')
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
        res.redirect('/admin/errorPage')
        console.log('error in the details in orderController in adminSide : ' + e)
    }
}

const orderpagination = async (req, res) => {
    try {
        let current = req.query.current
        console.log(req.query)
        console.log(current)
        if (req.query.next) {
            current++
        }
        if (req.query.prev) {
            current--
        }
        const dataCount = await orderData.find({}).count()
        console.log(dataCount)
        let count = Math.floor(dataCount / 5)
        console.log(count)
        let displayprev = 1
        if (current <= 0) displayprev = 0
        let displaynxt = 1
        if (current >= count - 1) displaynxt = 0
        const dataOrder = await orderData.find({}).skip(current * 5).limit(5).sort({ '_id': -1 })
        res.render('admin_orders', { dataOrder, current, displayprev, displaynxt })

    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log('error in the orderpagination in orderController in admin side:' + e)
    }
}

const returnDetails = async (req, res) => {
    try {
        console.log(req.query)
        await orderData.updateOne({ orderId: req.query.id, product: req.query.product },{returnStatus:1})
        const user = await orderData.findOne({ orderId: req.query.id, product: req.query.product })

        console.log(user,'11111111111111111111111111111111111111111111111')
        let amount = user.price * user.quentity
        console.log(amount)
        await userDetails.updateOne({username:user.username},{$set:{wallet:amount}},{upsert:true})
        res.redirect(`/admin/orderDetails?orderId=${req.query.id}&product=${req.query.product}`)
    } catch (e) {
        res.redirect('/admin/errorPage')
        console.log('error in the returnDetails in the ordetrController in the admin side : ' + e)
    }
}

const returnFail = async (req,res)=>{
    try{
        console.log(req.query,'222222222222222222222222222222222222222222222222')
        await orderData.updateOne({ orderId: req.query.id, product: req.query.product },{returnStatus:2})
        res.redirect(`/admin/orderDetails?orderId=${req.query.id}&product=${req.query.product}`)
    }catch(e){
        res.redirect('/admin/errorPage')
        console.log('error in the returnFail of orderController in admin side : ' + e)
    }
}

const puppeteer = require('puppeteer'); // Ensure Puppeteer is required at the top

const salesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.body;

        console.log(req.body);

        const Product = await orderData.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            },
            {
                $group: {
                    _id: "$product",
                    totalOrders: { $sum: 1 }
                }
            }
        ]);
        console.log(Product);

        const status = await orderData.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    }
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sales Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    h2 {
                        text-align: center;
                        color: #444;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    table, th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                    }
                    th {
                        background-color: #f2f2f2;
                        text-align: left;
                    }
                    td {
                        text-align: left;
                    }
                    .product-image {
                        width: 50px;
                        height: 50px;
                        object-fit: cover;
                    }
                    .summary {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .summary h3 {
                        margin: 0;
                        color: #555;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding: 10px;
                        background-color: #f9f9f9;
                        border-top: 1px solid #ddd;
                    }
                    .footer p {
                        margin: 0;
                        font-size: 12px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <h2>Sales Report</h2>
                <div class="summary">
                    <h3>Report Period: ${startDate} to ${endDate}</h3>
                </div>

                <h3>Total Sales by Product</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Sl No</th>
                            <th>Product</th>
                            <th>Total Orders</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Product.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item._id}</td>
                            <td>${item.totalOrders}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>

                <h3>Order Status Summary</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Sl No</th>
                            <th>Status</th>
                            <th>Total Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${status.map((item, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item._id}</td>
                            <td>${item.count}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Generated by WatchStore Sales System &copy; ${new Date().getFullYear()}</p>
                </div>
            </body>
            </html>
        `;

        // Launch Puppeteer, without specifying `executablePath`
        const browser = await puppeteer.launch({
            headless: true,  
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent);

        // Generate PDF from the content
        const pdfBuffer = await page.pdf();

        await browser.close();

        // Set the response headers and send the PDF
        res.setHeader("Content-Length", pdfBuffer.length);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=sales_report_watches.pdf");
        res.status(200).end(pdfBuffer);

    } catch (err) {
        console.log(err);
        res.redirect('/admin/errorPage');
    }
};



module.exports = {
    updateOrderStatus,
    orders,
    deleteOrder,
    searchOrder,
    details,
    salesReport,
    orderpagination,
    returnDetails,
    returnFail
}