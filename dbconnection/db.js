const mongoose = require("mongoose");

const dbConnection = () => {
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
};
module.exports = dbConnection;
