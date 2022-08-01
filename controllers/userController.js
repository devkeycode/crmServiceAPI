//this file contains the logic for handling the User Resource

const User = require("../models/userModel");
const {
  filterUserSetResponse,
  filterUserResponse,
} = require("../utils/objectConverter");
const { userTypes, userStatuses } = require("../utils/constants");

//get all the list of the users
exports.findAllUsers = async (req, res) => {
  const queryObj = {};
  //if optional queryParam passed along with the request,then add them to the queryObj

  if (req.query.userType) {
    queryObj.userType = req.query.userType;
  }
  if (req.query.userStatus) {
    queryObj.userStatus = req.query.userStatus;
  }

  try {
    const users = await User.find(queryObj);
    return res.status(200).json({
      success: true,
      documentResultsCount: users.length,
      data: filterUserSetResponse(users),
    });
  } catch (error) {
    console.error("Error while fetching all the users", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get a single user based on userId
exports.findByUserId = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });

    // user validation would have happened in the middleware itself
    return res.status(200).json({
      success: true,
      data: filterUserResponse(user),
    });
  } catch (error) {
    console.error("Error while searching the user ", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//update user
//name,userStatus,
exports.update = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    const signedInUser = await User.findOne({ userId: req.userId });
    //ensure if userType requested in body is Engineer or Admin , then make UserStatus as pending(execpt for Customer userType) before changing userType since only admin with approved status can approve the engineer or other admin later
    if (req.body.userType) {
      user.userStatus = userStatuses.pending;
      user.userType = req.body.userType;
    }

    //ensure if req.body.userType is CUSTOMER, make the userStatus approved
    if (req.body.userType === userTypes.customer) {
      user.userStatus = userStatuses.approved;
    }
    //check if currently SignIn user ,userType is Admin(and having approvedUserStatus), then only allow the User to update UserStatus otherwise,keep userStatus remain same
    if (
      req.body.userStatus &&
      signedInUser.userType === userTypes.admin &&
      signedInUser.userStatus === userStatuses.approved
    ) {
      user.userStatus = req.body.userStatus;
    }

    if (req.body.name) {
      //update user name
      user.name = req.body.name;
    }

    //save the user in the db
    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      data: filterUserResponse(updatedUser),
    });
  } catch (error) {
    console.log("Error while updating user", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
