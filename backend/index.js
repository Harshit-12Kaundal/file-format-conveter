const express =require('express');
const multer =require('multer');
const docxTopdf= require('docx-pdf');
const path = require('path');


const app = express();
const port =3001
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


app.post('/convertfile', upload.single('file'), (req, res, next)=> {
    try {
        if(!req.file){
            return res.status(400).json({
                message:"No file was uploaded"
            });
        }
        let outputpath = path.join(__dirname, 'files',`${req.file.originalname}.pdf`)
            docxTopdf(req.file.path,outputpath,(err,result)=>{
            if(err){
            console.log(err);
            return res.status(500).json({
                message:"error in converting Docx to Pdf file"
            })
            }
            console.log('result'+result);
            res.download(outputpath ,() =>{
                console.log("file Downloaded")
            })
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Internal server error"
        })
    }
})
  

app.listen(port, ()=>{
    console.log(`listening on port ${port}`); 
});