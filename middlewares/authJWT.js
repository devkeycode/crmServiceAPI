//This middleware file is related to authentication and authorization of the user.
//Authentication done by verifying the access token passed in headers ,which usually send along with the request.
//Authorization done by validating if user is allowed to access particular request on the particular resource or not.

const jwt = require("jsonwebtoken");
const authConfig = require("../configs/auth.config");
const { userTypes, userStatuses } = require("../utils/constants");
const User = require("../models/userModel");
const { isValidObjectId } = require("mongoose");

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  //check token is passed with the request or not
  if (!token) {
    //forbidden-403 http status
    return res.status(403).json({
      success: false,
      message: "No Token provided. Access Prohibited.",
    });
  }
  //token has been passed, validate the passed token
  jwt.verify(token, authConfig.secret, (error, decoded) => {
    if (error) {
      console.log(error);
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }
    //decoded object will be having the payload that was given during the jwt (token) creation
    //extracting id from the decoded payload and assign it as property in request object, so specific user can be accessed in this request processing pipeline
    req.userId = decoded.id;

    //call the next function- middleware or controller function
    next();
  });
};

//to validate the given userType is admin or not and userStatus is approved too,then only able to access
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({
      userId: req.userId,
      userStatus: userStatuses.approved,
    });
    if (user && user.userType === userTypes.admin) {
      //if userType is admin, pass the control to next
      next();
    } else {
      //access not allowed
      return res.status(403).json({
        success: false,
        message:
          "No access allowed to the user for this requested endpoint. ADMIN WITH APRROVED STATUS only allowed",
      });
    }
  } catch (error) {
    console.error("Internal server error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching the data. ",
    });
  }
};

//to validate given user is Admin(all access) or Owner(userId belongs to the user only, so able to access)
//user.userType==="ADMIN" -> for admin user
//user.userId === req.userId;-> for owner user
const isAdminOrOwner = async (req, res, next) => {
  try {
    const signedInUser = await User.findOne({
      userId: req.userId,
    });
    if (
      signedInUser &&
      (signedInUser.userType === userTypes.admin ||
        signedInUser.userId === req.params.id)
    ) {
      next(); //pass the control
    } else {
      //not a valid user to access this endpoint
      return res.status(403).json({
        success: false,
        message:
          "No access allowed to the user for this requested endpoint.ADMIN or Owner only allowed.",
      });
    }
  } catch (error) {
    console.error("Internal server error", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching the data. ",
    });
  }
};

//to check whether the ValidUserId passed as request parameter
const isValidUserIdInReqParam = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "UserId passed,doesn't exist.",
      });
    }
    //userId exists,pass the control to next
    next();
  } catch (error) {
    console.log("Error while reading the user info", error.message);
    return res.status(500).send({
      message: "Internal server error while reading the user data",
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isAdminOrOwner,
  isValidUserIdInReqParam,
};
