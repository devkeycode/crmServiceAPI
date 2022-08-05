//this file contains the logic for handling the user registration(signUp) and user signIn
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userStatuses, userTypes } = require("../utils/constants");
const { filterUserResponse } = require("../utils/objectConverter");
const User = require("../models/userModel");
const authConfig = require("../configs/auth.config");
//controller function to handle signup
exports.signup = async (req, res) => {
  //user{name,email,userId,password} are required fields
  //for customer,userType is optional
  const { name, email, userId, password, userType } = req.body;

  let userStatus;

  if (userType && userType === userTypes.engineer) {
    //userType is provided and userType is ENGINEER, ensure to make userStatus as pending
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
    console.log("Internal error , ", err.message);
    res.status(500).json({
      success: false,
      message: "Some internal server error",
    });
  }
};

//controller function to handle signin
exports.signin = async (req, res) => {
  const { userId, password } = req.body;

  try {
    //check whether user with given userId exists or not
    const user = await User.findOne({ userId });
    if (user == null) {
      return res.status(400).json({
        success: false,
        message: "UserId does not exist.Provide a valid userId to signIn.",
      });
    }
    //user exists, now only allow user with APPROVED userStatus to continue,else return
    if (user.userStatus !== userStatuses.approved) {
      return res.status(400).json({
        success: false,
        message: `UserStatus is not approved yet. Current userStatus is - ${user.userStatus}`,
      });
    }
    //check whether the password matches against the password in the database for the user, to validate the user
    const isPasswordMatched = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatched) {
      return res
        .status(401)
        .json({ success: false, message: " Password doesn't matched." });
    }
    //since user is validated,so create access token (using jsonwebtoken library) and send it along with other values in response body
    const token = jwt.sign({ id: user.userId }, authConfig.secret, {
      expiresIn: authConfig.expiryPeriod,
    });
    //send the response
    return res.status(200).json({
      success: true,
      data: { ...filterUserResponse(user), accessToken: token },
    });
  } catch (error) {
    console.log("Internal error -> ", error.message);
    res.status(500).json({
      success: false,
      message: "Some internal server error while signin",
    });
  }
};
