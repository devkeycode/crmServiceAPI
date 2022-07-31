//this middleware file contains the logic to validate signup request body ,and if request body validated then only pass the control to the next function in the procesing pipeline(usually controller or next middleware)

const User = require("../../models/userModel");
const { userTypes } = require("../../utils/constants");

const trimValuesInRequestBody = require("../../utils/trimRequestBody");
const { isValueUnique } = require("../../utils/checkUniqueValueInModelDoc");
exports.validateSignUpRequestBody = async (req, res, next) => {
  trimValuesInRequestBody(req); //to remove unwanted spaces
  //User REQUEST BODY required properties{name,email,password,userId}
  const { name, email, password, userId, userType } = req.body;
  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required field and is not provided.",
    });
  }
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required field and is not provided.",
    });
  }
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required field and is not provided.",
    });
  }
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "UserId is required field and is not provided.",
    });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Email provided is invalid.",
    });
  }
  if (!validatePasswordStrength(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Provide a strong password. Please ensure password must satisfies the condition.Password must be minimum of 10 characters length,containing at least - one lowercase letter, one uppercase letter, one numeric digit, and  one special character.",
    });
  }

  //check whether the email(provided in request body) is available to take or not
  let isAvailableToTake = await isValueUnique(User, { email });

  if (isAvailableToTake instanceof Error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while validating the request",
    });
  } else if (isAvailableToTake == false) {
    return res.status(400).json({
      success: false,
      message: "Email is already taken.",
    });
  }

  //check whether the userId(provided in request body) is unique or not.
  isAvailableToTake = await isValueUnique(User, { userId });
  if (isAvailableToTake instanceof Error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while validating the request",
    });
  } else if (isAvailableToTake == false) {
    return res.status(400).json({
      success: false,
      message: "User Id is already taken.",
    });
  }

  if (userType) {
    //if userType is provided in request body , then ensure userType provided value is one of those values [CUSTOMER,ENGINEER]
    if (userType === userTypes.admin) {
      return res.status(400).json({
        success: false,
        message: "User registration as ADMIN userType not allowed.",
      });
    }
    if (![userTypes.customer, userTypes.engineer].includes(userType)) {
      return res.status(400).json({
        success: false,
        message:
          "UserType provided is not correct value. Allowed values for userType: CUSTOMER , ENGINEER",
      });
    }
  }
  //if all the validation passed on request body , pass the control to next function in pipeline
  next();
};

/**
 *
 * @param {String} email
 * @returns {Boolean} true or false
 * @Description To check email is in valid email format or not
 */

function isValidEmail(email) {
  const regExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regExp.test(email);
}

/**
 *
 * @param {String} password
 * @returns {Boolean} true or false
 * @Description To check whether password have minimum strength,that have at least one lowercase,one uppercase,one digit,one special character and minimum length of 10 character
 */
function validatePasswordStrength(password) {
  const regExp =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{10,}$/;
  return regExp.test(password);
}
