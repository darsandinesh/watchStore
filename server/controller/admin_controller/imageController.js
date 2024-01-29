const multer = require('multer');
const product = require('./productController')

// Multer configuration for handling multiple file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});


// Multer upload middleware setup
const upload = multer({ storage: storage }).array('images', 5);

// Route handler for form submission
const imgUpload = (req, res) => {
  // console.log(req.files)
  // console.log(req.body)
  upload(req, res, function (err) {
    if (err) {
      console.log("Error: " + err.message)
    } else {
      product.addProduct(req.body, req.files)
      res.redirect('/admin/add_products?datasuccess=Product added successfully')
    }
  });
};


// app.post('/profile', upload.single('avatar'), function (req, res, next) {
//   // req.file is the `avatar` file
//   // req.body will hold the text fields, if there were any
// })

const singleImage = (req, res) => {
  try {
    upload(req, res, function (err) {
      if (err) {
        console.log("error in singleIMage : " + err)
      } else {
        product.edit_product(req.body, req.files, req.params.id)
        res.redirect('/admin/products')
      }
    })
  } catch (e) {
    console.log('error in the singleImage uploda : ' + e)
  }
}

module.exports = {
  imgUpload,
  singleImage,
  upload,
}

