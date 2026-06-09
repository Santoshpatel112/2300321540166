import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app=express();
app.use(express.json());
app.use(cors());

const PORT=process.env.PORT;



app.listen(PORT,()=>{
    console.log(`app listning on port ${PORT}`);
})



