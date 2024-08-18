const express = require('express');
const multer = require('multer');
const path = require('path');
const cors =require('cors')
require('dotenv').config(); 

const app = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
const upload = multer({ dest: 'uploads/' });

const docxRoutes = require('./routes/docxRoute');
const pdfRoutes = require('./routes/pdfRoute');
const { config, configDotenv } = require('dotenv');

app.get('/', (req, res)=>{
    res.status(200).json({'message':'hello'});
})

app.use('/convertfile/docx', docxRoutes);
app.use('/convertfile/pdf', pdfRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
