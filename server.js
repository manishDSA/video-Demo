const express= require('express')
const multer= require('multer')
const {google}= require("googleapis")
const path= require('path')
const cors = require ('cors')
const fs= require('fs')
 

const app= express();

app.use(express.static("."))

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST","Option"],
        allowedHeaders: ["Content-Type","Authorization"],
    })
);
const upload= multer({dest:"uploads/"})

  app.post('/upload', upload.single("video"),async (req,res)=>{
    if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).send("No file uploaded")
        
    }
    try{
        console.log("File recevied:",req.file);
        
        const auth = new google.auth.GoogleAuth({
            keyFile:"video-recorder-app-434815-bf7caa05ba48.json",

            scopes: ["https://www.googleapis.com/auth/drive.file"],
        });
        const driveService = google.drive({ version:"v3", auth});
        const fileMetadata= {
            name:`${req.file.originalname}`,
            parents: ["1NC2vmvkRvaygJ8blNqmKt5CJBhG34XKY"],
        };
        const media ={
            mimeType:req.file.mimetype,
            body:fs.createReadStream(path.join(__dirname,req.file.path))
        };

        const file= await driveService.files.create({
            resource: fileMetadata,
            media: media,
            fields:"id",
        });
        console.log("File uploaded to Google Drive:", file.data.id);
        fs.unlinkSync(path.join(__dirname,req.file.path));

        res.send(`File uploaded successfully: ${file.data.id}`);
        
    }
    catch (error) {
        if(error.response){
            console.error("Error uploading file to Google Drive:", error.response.data);
        }
        else{
            console.error("Error uploading file to Google Drive:", error);
        }
        res.status(500).send("Error uploading to Google Drive")
    }
  });

   

  

  app.listen(3000,()=>{
    console.log("Server is running on 3000");
    
  })