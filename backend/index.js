const express =require('express');
const app = express();
const port =3001
const multer =require('multer');


// setting up the file storage

const storage =multer.diskStorage({
    destination: function(req, res , cb) {
        cb(null ,"uploads");
    },
    filename: function(req, res, cb) {
        cb(null ,file.originalname );
    },
});

const upload = multer({ dest: 'uploads/' })


app.post('/profile', upload.single('file'), function (req, res, next) {
    try {
        
    } catch (error) {
        console.log(error);
    }
})
  

app.listen(port, ()=>{
    console.log(`listening on port ${port}`); 
});