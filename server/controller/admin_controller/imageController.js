const multer = require('multer');
const sharp = require('sharp')
const fs = require('fs');
const path = require('path');
const product = require('./productController')

// Multer configuration for handling multiple file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});


// Multer upload middleware setup
const upload = multer({ storage: storage }).array('images', 5);

// Route handler for form submission
const imgUpload = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log("Error: " + err.message);
      return res.status(500).send('Error uploading files.');
    }

    console.log(req.files, '---------------');
    const files = req.files;
    const uploadedImages = [];

    for (const file of files) {
      const resizedImageBuffer = await sharp(file.path)
        .resize({ width: 300, height: 300 }) 
        .toBuffer();

      const fileName = Date.now() + '-' + file.originalname;
      const filePath = path.join('./public/uploads/', fileName);
      console.log(filePath, 'filePath kitti--------------')

      fs.writeFileSync(filePath, resizedImageBuffer);

      uploadedImages.push({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: resizedImageBuffer.length,
        buffer: resizedImageBuffer,
        path: filePath
      });
    }

    console.log(uploadedImages, 'uploadedImages-----------------uploadedImages');
    product.addProduct(req.body, uploadedImages)
    res.redirect('/admin/products?product=Product uploaded and processed successfully. ')
  });
};


const singleImage = (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.log("error in singleIMage : " + err)
      } else {
        console.log(req.files, '---------------');
        const files = req.files;
        const uploadedImages = [];

        for (const file of files) {
          const resizedImageBuffer = await sharp(file.path)
            .resize({ width: 300, height: 300 }) 
            .toBuffer();


          const fileName = Date.now() + '-' + file.originalname; 
          const filePath = path.join('./public/uploads/', fileName);
          console.log(filePath, 'filePath kitti--------------')

          fs.writeFileSync(filePath, resizedImageBuffer);

          uploadedImages.push({
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: resizedImageBuffer.length,
            buffer: resizedImageBuffer,
            path: filePath
          });
        }

        console.log(uploadedImages, 'uploadedImages-----------------uploadedImages');
        product.edit_product(req.body, uploadedImages, req.params.id)
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

