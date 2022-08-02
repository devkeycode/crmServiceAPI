const { validateSignUpRequestBody } = require("./signUpRequest");
const { validateSignInRequestBody } = require("./signInRequest");
const {
  validateTicketRequestBody,
  validateTicketUpdateRequestBody,
} = require("./ticketRequest");

module.exports = {
  validateSignUpRequestBody,
  validateSignInRequestBody,
  validateTicketRequestBody,
  validateTicketUpdateRequestBody,
};
