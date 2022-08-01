const { validateSignUpRequestBody } = require("./signUpRequest");
const { validateSignInRequestBody } = require("./signInRequest");
const { validateTicketRequestBody } = require("./ticketRequest");

module.exports = {
  validateSignUpRequestBody,
  validateSignInRequestBody,
  validateTicketRequestBody,
};
