const mongoose = require("mongoose");

exports.connectDatabase = () => {
    mongoose
        .connect(process.env.DATABASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then((con) => console.log("Database connected", con.connection.host))
        .catch((err) => console.log(err));
};
