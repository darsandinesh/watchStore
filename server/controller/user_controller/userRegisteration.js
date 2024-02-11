const userDetails = require('../../model/userModel')
const productDetails = require('../../model/productModel')
const catDetails = require('../../model/categoryModel')
const sndmail = require('./generateotp')
const bcrypt = require('bcrypt')
const sharp = require('sharp');
require('dotenv').config();



//validating the dataa entered by the user during the user register
var OTP
var time
const registerUser = async (req, res) => {
    try {
        if (req.session.userAuth) {
            res.redirect('/home')
        } else {
            const { username, email, phone, password } = req.body
            req.session.details = req.body
            console.log(email)
            const userFound = await userDetails.findOne({ username: username })
            if (userFound) {
                res.redirect(`/user-register?uname=Username already exists`)
            } else if (phone.length == 10 || phone.length == 12) {
                // if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/)) {
                //   res.redirect(`/user-register?pass=type a strong password`)
                // } else {
                if (!email.match(/^[A-Za-z\._\-[0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)) {
                    res.redirect(`/user-register?uname=Enter the correct email address`)
                } else if (req.body.password != req.body.confirmpassword) {
                    res.redirect(`/user-register?uname=password does not match`)
                } else {
                    const otp = sndmail.sendmail(email)
                    otp.then((val) => {
                        OTP = val[0]
                        time = val[1]
                        console.log(OTP)
                        console.log(val[1])
                    }).catch((err) => {
                        console.log("ERRORR OCCUREDE IN REGISTERUSER : " + err)
                    })
                    res.redirect('/otp_verification')
                }
            }

            //}
            else res.redirect('/user-register?uname=Enter a valid phone number')
        }

    } catch (e) {
        console.log("error in registerUser userRegisteration controller user side : " + e)
        res.redirect("/error")
    }


}

// user register form is given to the user 
const user_register = async (req, res) => {
    try {
        if (req.session.userAuth) {
            res.redirect('/home')
        } else {
            if (req.query.uname) {
                const { username, email, phone, password } = req.session.details
                uname = req.query.uname
                uemali = req.query.email
                ephone = req.query.phone
                pass = req.query.pass
                const cat = await catDetails.find({ list: 0 })
                res.render('user-register', { uname, username, email, phone, password, uemali, ephone, pass, cat })
            }
            res.render('user-register')
        }
    } catch (e) {
        console.log("error in the user-register of user side: " + e)
        res.redirect("/error")
    }
}


// render top page to entre the otp 
const otpPage = (req, res) => {
    try {
        if (req.session.userAuth) {
            res.redirect('/home')
        } else {
            res.render('user-pass-otp')
        }
    } catch (e) {
        console.log("error in the otpPage user controller : " + e)
        res.redirect("/error")
    }

}




//otp validation during the time of register a new user and saved to db
var OTP
var resendOTP
const otpVerification = async (req, res) => {
    try {
        if (req.session.userAuth) {
            res.redirect('/home')
        } else {
            // console.log(OTP)
            console.log(req.body.otp)
            const otptime = Date.now()
            const diff = otptime - time
            console.log(diff)
            console.log(req.session.details)
            if (OTP == req.body.otp ||resendOTP == req.body.otp ) {
                if (diff <= 300000) {
                    const { username, email, phone, password } = req.session.details
                    const hashedpass = await bcrypt.hash(password, 10)
                    const newUser = new userDetails({
                        username: username,
                        phone: phone,
                        email: email,
                        password: hashedpass,
                        isAdmin: 0,
                        status: 0,
                    })
                    console.log("User added to the database!!!!!!")
                    await newUser.save()
                    res.redirect('/login')
                } else {
                    // res.redirect('/otp_verification?otpinvalid= Time expired')
                    res.redirect('/user-register?uname=Time expired')
                }

            } else {
                res.redirect('/otp_verification?otpinvalid= Invalid OTP')
            }
        }
    } catch (e) {
        console.log('error in the otpVerification in userRegisteration controller user side : ' + e)
        res.redirect("/error")
    }

}


// code for rnedering thr opt generation page
const reset_otp_verification = async (req, res) => {
    try {
        if (req.session.userAuth) {
            res.redirect('/home')
        } else {
            notvalidotp = req.query.otpinvalid
            const cat = await catDetails.find({ list: 0 })
            res.render('newpassotp', { notvalidotp, cat })
        }
    } catch (e) {
        console.log("error in the reset_otp_verification of the user controller : " + e)
        res.redirect("/error")
    }
}

// sending mail to use emila during  the reset of the password
var resetOtp
const resetotpv = async (req, res) => {
    console.log(req.body.otp)
    try {
        if (req.session.userAuth) {
            res.redirect('/home')
        } else {
            const email = req.body.otp
            const emailFound = await userDetails.findOne({ email: email })
            if (emailFound) {
                const otp = sndmail.sendmail(email)
                otp.then((val) => {
                    console.log("otp: : " + val)
                    resetOtp = val
                }).catch((err) => {
                    console.log("error in generating the otp in resetotp in user side : " + err)
                })
                req.session.changepass = req.body.otp
                res.redirect('/reset_otp_verification')

            } else {
                res.redirect('/user-reset-password?fail=Email is not correct')
            }
        }
    } catch (e) {
        console.log("Error in resetotp in user side : " + e)
        res.redirect("/error")
    }
}


// code for resetting thr password otp generation
const resetotpVerification = (req, res) => {
    try {
        if (req.session.userAuth) {
            res.redirect('/home')
        } else {
            console.log(req.body.otp)
            console.log(resetOtp)
            if (resetOtp == req.body.otp) {
                res.redirect('/reset-password')
            } else {
                res.redirect('/reset_otp_verification?otpinvalid=Invalid otp')
            }
        }
    } catch (e) {
        console.log("Eorror in resetotpVerification in user side : " + e)
        res.redirect("/error")
    }
}

const resendotp = (req, res) => {
    try {
        console.log(req.session.details)
        let email = req.session.details.email
        const otp = sndmail.sendmail(email)
        otp.then((val) => {
            resendOTP = val[0]
            time = val[1]
            console.log(OTP)
            console.log(val[1])
        }).catch((err) => {
            console.log("ERRORR OCCUREDE IN REGISTERUSER : " + err)
        })
        res.redirect('/otp_verification')
    } catch (e) {
        console.log('error in the resendotp in userRegisterationController in user side:' + e)
        res.redirect("/error")
    }
}

module.exports = {
    user_register,
    registerUser,
    reset_otp_verification,
    resetotpVerification,
    otpVerification,
    otpPage,
    resetotpv,
    resendotp
}