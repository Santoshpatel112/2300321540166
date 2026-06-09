import mongoose  from "mongoose";

const DbConnect=async ()=>{
    try {
        const db=process.env.MONGO_URI;
        if(!db){
            return resizeBy.status(400).json({message :"MONGOURI not found"});
        }
        await mongoose.connect(db);
        console.log("Db Connected Sucessfully");
    } catch (error) {
        return resizeBy.status(500).json({message :error.message});
    }
}