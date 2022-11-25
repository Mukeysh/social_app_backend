const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("dotenv").config({ path: "backend/config/config.env" });

//using middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// importing routes
const user = require("./routes/user");
const post = require("./routes/post");

// using routes
app.use("/api/v1", post);
app.use("/api/v1", user);

module.exports = app;
