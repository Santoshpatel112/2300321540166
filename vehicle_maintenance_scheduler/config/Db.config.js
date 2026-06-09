const mongoose = require("mongoose");

const DbConnect = async () => {
    try {
        const db = process.env.MONGO_URI;
        if (!db) {
            throw new Error("MONGO_URI not found in environment variables");
        }
        await mongoose.connect(db);
        console.log("DB Connected Successfully");
    } catch (error) {
        console.error("DB Connection Error:", error.message);
        process.exit(1);
    }
};

module.exports = DbConnect;