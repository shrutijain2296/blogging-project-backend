const express = require("express")
require('dotenv').config();
const cors = require("cors");

// file imports
const db = require("./config/db");
const userRoutes = require("./routes/user")
const blogRoutes = require("./routes/blog");
const followRoutes = require("./routes/follow");
const { cleanUpBin } = require("./utils/cron");

const app = express();
const PORT = process.env.PORT;

// middlewares
app.use(express.json());
app.use(cors({
    origin: "*",  //* means that we can accept it from anywhere
}));

// routes
app.use("/user", userRoutes);
// localhost:3001/user/register
app.use("/blog", blogRoutes);
app.use("/follow", followRoutes);

// listen function is always on
app.listen(PORT, () => {
    console.log("Server running at port: ", PORT);
    cleanUpBin()
});
