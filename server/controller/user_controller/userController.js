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
require('dotenv').config();

const home = async (req, res) => {
  try {
    const userin = req.session.userName
    const allProducts = await productDetails.find({ list: 0 }).limit(6)
    const women = await productDetails.find({ category: "Women" }).limit(3)
    const men = await productDetails.find({ category: "Men" }).limit(3)
    const cat = await catDetails.find({ list: 0 })
    const cartCount = await cart.find({ username: req.session.userName }).countDocuments()
    const wishCount = await wish.find({ username: userin }).countDocuments()
    console.log('cartCount before')
    console.log(cartCount)
    res.render('home', { allProducts, women, men, userin, cat, cartCount, wishCount })
    // res.render('home',{userin})
  } catch (e) {
    console.log('error in the home usercontroller in user side : ' + e)
    res.redirect("/error")
  }
}

const checkUser = async (req, res, next) => {
  try {
    const data = await userDetails.find({ username: req.session.userName })
    console.log(data)
    console.log(req.session.userName)
    if (data.length > 0) {
      if (data[0].status == 0) {
        console.log("asjdhfjasasbab" + data.status)
        next()
      } else {
        console.log("jjjjjjjjjj" + data.status)
        req.session.destroy()
        // req.session.userAuth = false
        res.redirect('/login?block=You have been blocked ')
      }
    } else {
      res.redirect('/login?block=Please Sign In')
    }
    // console.log(data[0].status)

  } catch (e) {
    console.log('Error in the checkUser user side : ' + e)
    res.redirect("/error")
  }
}



// first page which is given to user when make a request to localhost:8888
const login = async (req, res) => {
  try {
    if (req.session.userAuth) {
      res.redirect('/home')
    } else {
      const block = req.query.block
      const username = req.query.username
      const pass = req.query.pass
      const userin = req.session.userName
      console.log(userin)
      console.log(block + " " + username + " " + pass)
      const cat = await catDetails.find({ list: 0 })
      res.render('userlogin', { block, username, pass, userin, cat })
    }
  } catch (e) {
    console.log("error in the login route of user controller : " + e)
    res.redirect("/error")
  }
}





// validation of the user befor entering the account ie. login validation
const validateUser = async (req, res) => {
  try {
    console.log("validateUser")
    console.log(req.body.password)
    const userFound = await userDetails.findOne({ username: req.body.username })
    console.log(userFound)
    if (userFound) {
      if (userFound.status == 0) {
        const checkpass = await bcrypt.compare(req.body.password, userFound.password)
        if (checkpass) {
          req.session.userAuth = true
          req.session.userName = req.body.username
          res.redirect('/home')
        } else {
          res.redirect('/login?pass=incorrect password')
        }
      } else {
        res.redirect('/login?block= Entry for you have been denied')
      }

    } else {
      res.redirect('/login?username=incorrect username')

    }
  } catch (e) {
    res.redirect("/error")
  }


}


const userAccount = async (req, res) => {
  try {
    console.log(req.params.id)
    const userin = req.session.userName

    const userData = await userPro.findOne({ username: userin, primary: 1 })
    const user = await userDetails.findOne({ username: userin })
    const useraddress = await userPro.find({ username: userin, primary: 0 })
    console.log(user)
    const username = userin
    const cat = await catDetails.find({ list: 0 })
    res.render('user-account', { userData, user, userin, cat, useraddress, username })
  } catch (e) {
    console.log('error in the userAccount of userController in user side : ' + e)
    res.redirect("/error")
  }
}

const newAddress = async (req, res) => {
  try {
    const userin = req.session.userName
    console.log(userin)
    console.log(req.body)
    const newAddress = new userPro({
      username: userin,
      fullname: req.body.fullname,
      phone: req.body.phone,
      address: {
        houseName: req.body.house,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        pincode: req.body.pincode
      },
      primary: 0
    })
    await newAddress.save()
    res.redirect(`/useraccount/${userin}`)

  } catch (e) {
    console.log('error in the newAddress in userController in the user side:' + e)
    res.redirect("/error")
  }
}

// user-reset-password route user can reset the password
const reset_password = async (req, res) => {
  try {
    if (req.session.userAuth) {
      res.redirect('/home')
    } else {
      const val = req.query.fail
      const cat = await catDetails.find({ list: 0 })
      res.render('user-pas-reset', { val, cat })
    }
  } catch (e) {
    console.log("error in the reset-password controller ; " + e)
    res.redirect("/error")
  }
}

//======================================================================= 
const passresetverification = async (req, res) => {
  try {
    if (req.session.userAuth) {
      res.redirect('/home')
    } else {
      notvalidotp = req.query.otpinvalid
      const cat = await catDetails.find({ list: 0 })
      res.render('user-pass-otp', { notvalidotp, cat })
    }
  } catch (e) {
    console.log("erroor in the passresetverification user controller : " + e)
    res.redirect("/error")
  }
}


// reset-password render page 
const reset_password_get = (req, res) => {
  try {
    if (req.session.userAuth) {
      res.redirect('/home')
    } else {
      res.render('user-newPassword')
    }
  } catch (e) {
    console.log("error in the reset_password controller : " + e)
    res.redirect("/error")
  }
}


// user can reset the password, create new password
const newpass = async (req, res) => {
  try {
    const userFound = await userDetails.findOne({ email: req.session.changepass })
    const pass = req.body.newpass
    console.log(req.body.newpass)
    console.log(req.session.changepass)
    if (userFound) {
      const hashpass = await bcrypt.hash(pass, 10)
      await userDetails.updateOne({ email: req.session.changepass }, { $set: { password: hashpass } })
      res.redirect('/login')
    } else {
      console.log("Something went wrong in updating the password of the user")
    }
  } catch (e) {
    console.log("Error in the newpass in user side : " + e)
    res.redirect("/error")
  }
}

const signout = async (req, res) => {
  try {
    await req.session.destroy()
    // req.session.userAuth = false
    res.redirect('/')
  } catch (e) {
    console.log("error in the signout page of the user : " + e)
    res.redirect("/error")
  }
}


// to zoom the images of the product
const zoom = async (req, res) => {
  try {
    const path = req.params.path

    console.log(path)
    const originalImage = sharp(path)
    const zoomedImage = await originalImage.resize(Number(500), Number(500)).toBuffer();
    res.set('Content-Type', 'image/webp')
    res.send(zoomedImage)


  } catch (e) {
    console.log("error in the zoom of user controller :" + e)
    res.redirect("/error")
  }
}

const verifyOldPassword = (req, res) => {
  try {
    console.log(req.body)
    if (req.body.pass == '123') {
      res.json({ success: true })
    } else {
      res.json({ success: false })
    }
  } catch (e) {
    console.log('error in the verifyOldPassword in the userController in the user side : ' + e)
    res.redirect('/error')
  }
}

// sortin based the user requiments
const errorPage = (req, res) => {
  res.render('errorPage')
}


// exporting all function 
module.exports = {
  home,
  validateUser,
  newpass,
  zoom,
  login,
  reset_password_get,
  reset_password,
  passresetverification,
  signout,
  checkUser,
  userAccount,
  newAddress,
  errorPage,
  verifyOldPassword
}