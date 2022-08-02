const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/userModel");
const { PORT } = require("./configs/server.config");
const { DB_URI } = require("./configs/db.config");
const { userTypes } = require("./utils/constants");
const app = express();

//attaching middlewares to request processing pipeline
//json middleware-to parse request bodies of json format
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes middlewares, connect route to server by passing app object,so routes attached to the server
require("./routes/authRoute")(app);
require("./routes/userRoute")(app);
require("./routes/ticketRoute")(app);

//ADMIN creation at server startup phase(for testing purposes)(usually a admin will be created at database side)
const initialiseDBRecords = async () => {
  try {
    //check if admin is already present in the db
    const admin = await User.findOne({ userType: userTypes.admin });
    //if admin user is not present in the db, then create the admin else return
    if (!admin) {
      await User.create({
        name: "John Doe",
        userId: "admin",
        password: bcrypt.hashSync("crmService@1", 10),
        email: "john@email.com",
        userType: userTypes.admin,
      });
      console.log("Admin user successfully created");
    } else {
      return;
    }
  } catch (error) {
    console.error("Error while creating admin records-> ", error.message);
  }
};

//Connect to db and admin creation(admin creation only for development testing purpose)
const connectDB = async () => {
  mongoose.connect(DB_URI);
  const db = mongoose.connection;
  db.on("error", () => {
    console.error("Error while connecting to DB-> ", DB_URI);
  });
  db.once("open", () => {
    console.log("Successfull connection to DB estabished.");
    initialiseDBRecords();
  });
};

//initialising the DB connection and starting the server
const startApp = async () => {
  app.listen(PORT, () => {
    console.log("App listening at port", PORT);
  });
  //establish db connection
  connectDB();
};

startApp();
