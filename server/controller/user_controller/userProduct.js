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
        res.redirect("/error")
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
        res.redirect("/error")
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
        res.redirect("/error")
    }
}

//listing the product and also pagination is also handled with category
const catProduct = async (req, res) => {
    try {
        let category
        console.log(req.params.id)
        if (req.params.id) {
            category = req.params.id
        } else {
            category = 'all'
        }
        let currentPage = req.query.page || 0
        if (req.query.next) {
            currentPage++
        }
        if (req.query.prev) {
            currentPage--
        }
        let skipCount = currentPage
        let totalCount = 0
        let Product
        let data
        if (req.params.id == 'allproducts' || req.query.category == 'all') {
            category = 'all'
            totalCount = await productDetails.find({ list: 0 }).countDocuments()
            Product = await productDetails.find({ list: 0 }).skip(skipCount * 3).limit(3)
            data = 'All Products'
        } else {
            category = req.params.id || req.query.category
            totalCount = await productDetails.find({ $and: [{ list: 0 }, { category: category }] }).countDocuments()
            Product = await productDetails.find({ $and: [{ list: 0 }, { category: category }] }).skip(skipCount * 3).limit(3)
            data = category + 'Products'
        }
        console.log(Product)
        const cat = await catDetails.find({ list: 0 })
        let mulValue = currentPage * 3 + 3
        console.log(mulValue + 'mulVALue')
        let nextPage = 1
        if (mulValue >= totalCount) nextPage = 0
        let totalPageCount = Math.ceil(totalCount / 3)
        let presentPage = currentPage + 1
        res.render('user-products', {
            Product, cat, nextPage, currentPage, totalPageCount, presentPage, category, data

        })
    } catch (e) {
        console.log("error in the carProduct in userControler user side : " + e)
        res.redirect("/error")
    }
}


// const catProduct = async (req, res) => {
//     try {
//         console.log(req.params.id)
//         const userin = req.session.userName

//         console.log(req.query.previous)
//         console.log(req.query.next)

//         let previousValue = req.query.previous || 0
//         let nextValue = req.query.next || 0
//         let skipValue = nextValue * 5 + '' || previousValue * 5 + ''
//         console.log(skipValue)
//         let category = 'all'
//         if (req.params.id == 'allproducts' || category == 'all') {
//             console.log('allproduct in if')
//             Product = await productDetails.find({ list: 0 }).skip(skipValue).limit(5)
//             nextValue++
//             previousValue = nextValue - 1
//             data = "All Products"
//         } else {
//             console.log('category in else')
//             Product = await productDetails.find({ $and: [{ list: 0 }, { category: req.params.id }] })
//             data = `${req.params.id} Products`
//         }
//         const cat = await catDetails.find({ list: 0 })
//         console.log(Product)
//         res.render('user-products', {
//             Product, data, userin, cat,
//             previousValue,
//             nextValue
//         })
//     } catch (e) {
//         console.log("error in the carProduct in userControler user side : " + e)
//     }
// }

const wishlistProduct = async (req, res) => {
    try {
        const userin = req.session.userName
        const cat = await catDetails.find({ list: 0 })
        res.render('user-wish-list', { userin, cat })
    } catch (e) {
        console.log('error in the whishlistProduct of userProductController in user side ')
        res.redirect("/error")
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
        res.redirect("/error")
    }
}

const lowtohigh = async (req, res) => {
    try {
        const category = req.query.data || req.query.category
        let currentPage = req.query.page || 0
        if (req.query.next) {
            currentPage++
        }
        if (req.query.prev) {
            currentPage--
        }
        let skipCount = currentPage
        let totalCount = 0
        let Product
        let data
        if (category == "all") {
            totalCount = await productDetails.find({ list: 0 }).countDocuments()
            Product = await productDetails.find({ list: 0 }).skip(skipCount * 3).limit(3).sort({ price: 1 })
            data = 'All Products'
        } else {
            totalCount = await productDetails.find({ $and: [{ list: 0 }, { category: category }] }).countDocuments()
            Product = await productDetails.find({ $and: [{ list: 0 }, { category: category }] }).skip(skipCount * 3).limit(3).sort({ price: 1 })
            data = category + 'Products'
        }
        const userin = req.session.userName
        let mulValue = currentPage * 3 + 3
        let nextPage = 1
        if (mulValue >= totalCount) nextPage = 0
        let totalPageCount = Math.ceil(totalCount / 3)
        let presentPage = currentPage + 1
        const cat = await catDetails.find({ list: 0 })
        let sort = "lowhigh"
        res.render('user-products', {
            Product, userin, cat, category,
            nextPage, currentPage, totalPageCount, presentPage, category, data, sort
        })
    } catch (e) {
        console.log('error in the lowtohigh in userProduct in user side : ' + e)
        res.redirect("/error")
    }
}

const hightolow = async (req, res) => {
    try {
        const userin = req.session.userName
        const category = req.query.data || req.query.category
        let currentPage = req.query.page || 0
        if (req.query.next) {
            currentPage++
        }
        if (req.query.prev) {
            currentPage--
        }
        let skipCount = currentPage
        let totalCount = 0
        let Product
        let data
        if (category == "all") {

            totalCount = await productDetails.find({ list: 0 }).countDocuments()
            Product = await productDetails.find({ list: 0 }).skip(skipCount * 3).limit(3).sort({ price: -1 })
            data = 'All Products'
            
        } else {

            totalCount = await productDetails.find({ $and: [{ list: 0 }, { category: category }] }).countDocuments()
            Product = await productDetails.find({ $and: [{ list: 0 }, { category: category }] }).skip(skipCount * 3).limit(3).sort({ price: -1 })
            data = category + 'Products'
        }
        const cat = await catDetails.find({ list: 0 })
        let mulValue = currentPage * 3 + 3
        let nextPage = 1
        if (mulValue >= totalCount) nextPage = 0
        let totalPageCount = Math.ceil(totalCount / 3)
        let presentPage = currentPage + 1
        let sort = "lowhigh"
        res.render('user-products', {
            Product, userin, cat, category,
            nextPage, currentPage, totalPageCount, presentPage, category, data, sort
        })
    } catch (e) {
        console.log('error in the hightolow in userProduct in user side : ' + e)
        res.redirect("/error")
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



