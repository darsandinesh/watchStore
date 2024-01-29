const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const catDetails = require('../../model/categoryModel')
const cart = require('../../model/cartModel')
const wish = require('../../model/wishlistModel')
const sndmail = require('./generateotp')
const bcrypt = require('bcrypt')
const sharp = require('sharp');
require('dotenv').config();


// all the datas which are shown in the home page is controlled here
const homeData = async (req, res) => {
    try {
        if (!req.session.userAuth) {
            res.redirect('/login')
        } else {
            const allProducts = await productDetails.find({ list: 0 }).limit(6)
            const women = await productDetails.find({ category: "Women" }).limit(3)
            const men = await productDetails.find({ category: "Men" }).limit(3)
            console.log(women)
            console.log(men + "home men data")
            const cat = await catDetails.find({ list: 0 })
            const userin = req.session.userName
            const cartCount = await cart.find({ username: req.session.userName }).countDocuments()
            const wishCount = await wish.find({ username: userin }).countDocuments()
            console.log(cat)
            // if(allProducts & women & men){
            res.render('home', { allProducts, women, men, userin, cat, cartCount, wishCount })
            // } else{
            //   console.log("unable to fetch data to the home page")
            // }
        }
    } catch (e) {
        console.log("Error in the homeData in userproductCOntroller : " + e)
    }
}



// listing the details of a perticular product 
const productData = async (req, res) => {
    try {
        const details = await productDetails.findOne({ name: req.params.id })
        // const cat = details.category
        const relatedProduct = await productDetails.find({ $and: [{ category: details.category }, { name: { $ne: req.params.id } }] }).limit(3)
        console.log(relatedProduct)
        const cat = await catDetails.find({ list: 0 })
        const userin = req.session.userName
        // console.log(details)
        if (details) {
            const { name, description, category, price, imagePath, stock, about } = details
            res.render('user-productDetails', { name, description, category, price, imagePath, relatedProduct, userin, cat, stock, about })
        } else {
            console.log("userController - productData can't read data from db")
        }
    } catch (e) {
        console.log("Error in user side productData controller : " + e)
    }
}


// product listing based on category!!!!
const allproductData = async (req, res) => {
    try {
        const userin = req.session.userName
        const cat = await catDetails.find({ list: 0 })
        const totalProductCount = await productDetails.find({ list: 0 }).countDocuments()
        const pagenation = Math.ceil(totalProductCount / 2)
        console.log(pagenation + "pagenation count is displayed")

        const Product = await productDetails.find({ list: 0 })

        res.render('user-products', { Product, data: "All Products", userin, cat, pagenation })
    } catch (e) {
        console.log("Error in user side womenproductData : " + e)
    }
}


const catProduct = async (req, res) => {
    try {
        console.log(req.params.id)
        const userin = req.session.userName

        // console.log(req.query.page)
        // console.log(req.query.limit)
        // let page = parseInt(req.query.page) || 1
        // const pageSize = 5
        // const totalProducts = await productDetails.find({}).countDocuments()

        // const totalPage = Math.ceil(totalProducts / pageSize)
        // const hasPrevPage = page > 1
        // const hasNextPage = page < totalPage

        // const pages = Array.from({ length: totalPage }, (_, i) => {
        //     return {
        //         pageNumber: i + 1,
        //         isCurrent: i + 1 === page
        //     }
        // })

        if (req.params.id == 'allproducts') {
            console.log('allproduct in if')
            // if(page==1) page--
            // else page--
            // console.log(page)
            Product = await productDetails.find({ list: 0 })
            data = "All Products"
        } else {
            console.log('category in else')
            Product = await productDetails.find({ $and: [{ list: 0 }, { category: req.params.id }] })
            data = `${req.params.id} Products`
        }
        const cat = await catDetails.find({ list: 0 })
        console.log(Product)
        res.render('user-products', {
            Product, data, userin, cat,
        })
    } catch (e) {
        console.log("error in the carProduct in userControler user side : " + e)
    }
}

const wishlistProduct = async (req, res) => {
    try {
        const userin = req.session.userName
        const cat = await catDetails.find({ list: 0 })
        res.render('user-wish-list', { userin, cat })
    } catch (e) {
        console.log('error in the whishlistProduct of userProductController in user side ')
    }
}

const search = async (req, res) => {
    try {
        console.log('search entered')
        const datas = req.query.search
        console.log(datas)
        const regex = new RegExp(`${datas}`, 'i')
        console.log(regex)
        const Product = await productDetails.find({ name: regex })
        const cat = await catDetails.find({ list: 0 })
        console.log(Product)
        res.render('user-searchData', { Product, cat, datas })
    } catch (e) {
        console.log('error in the search in userside userProducts in userController :' + e)
    }
}

const lowtohigh = async (req, res) => {
    try {
        console.log('lowtohigh')
        const userin = req.session.userName
        const Product = await productDetails.find({ list: 0 }).sort({ price: 1 })
        const cat = await catDetails.find({ list: 0 })
        console.log(cat)
        res.render('user-products', { Product, userin, cat })
    } catch (e) {
        consol.log('error in the lowtohigh in userProduct in user side : ' + e)
    }
}

const hightolow = async (req, res) => {
    try {
        const userin = req.session.userName
        const Product = await productDetails.find({ list: 0 }).sort({ price: -1 })
        const cat = await catDetails.find({ list: 0 })
        console.log(cat)
        res.render('user-products', { Product, userin, cat })
    } catch (e) {
        consol.log('error in the hightolow in userProduct in user side : ' + e)
    }
}

// pagenation 


// exporting all modules in this  js file
module.exports = {
    homeData,
    productData,
    allproductData,
    catProduct,
    wishlistProduct,
    search,
    lowtohigh,
    hightolow,
}



