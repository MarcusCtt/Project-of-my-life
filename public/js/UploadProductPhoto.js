const multer = require('multer');

module.exports = (multer({
    storage: multer.diskStorage({
        destination: (req, file, cd) =>{
            cd(null, './public/images/produtos/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString +"__" + file.originalname)

    }})
}));