//this file contains the logic for handling the user registration(signUp) and user signIn
const bcrypt = require("bcryptjs");
const { userStatuses } = require("../utils/constants");
const { filterUserResponse } = require("../utils/objectConverter");
const User = require("../models/userModel");
exports.signup = async (req, res) => {
  //user{name,email,userId,password} are required fields
  //for customer,userType is optional
  const { name, email, userId, password, userType } = req.body;

  let userStatus;

  if (userType) {
    //userType is provided, ensure to make userStatus as pending
    userStatus = userStatuses.pending;
  }
  try {
    const userObject = await User.create({
      name,
      email,
      userId,
      password: bcrypt.hashSync(password, 10),
      userType,
      userStatus,
    });

    return res.status(201).json({
      success: true,
      data: filterUserResponse(userObject),
    });
  } catch (error) {
    console.log("Some error happened ", error);
    res.status(500).json({
      success: false,
      message: "Some internal server error",
    });
  }
};
