//this file contains the logic for handling the signup and signin requests
const authController = require("../controllers/authController");
const {
  validateSignUpRequestBody,
  validateSignInRequestBody,
} = require("../middlewares");

module.exports = (app) => {
  app.post(
    "/crmService/api/v1/auth/signup",
    [validateSignUpRequestBody],
    authController.signup
  );
  app.post(
    "/crmService/api/v1/auth/signin",
    [validateSignInRequestBody],
    authController.signin
  );
};
