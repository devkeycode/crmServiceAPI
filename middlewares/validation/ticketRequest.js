//this middleware file contains the logic to validate ticket  request body(during ticket creation) ,and if request body validated then only pass the control to the next function

const Ticket = require("../../models/ticketModel");
const trimValuesInRequestBody = require("../../utils/trimRequestBody");
const { ticketPriorities } = require("../../utils/constants");

exports.validateTicketRequestBody = async (req, res, next) => {
  trimValuesInRequestBody(req); //to remove unwanted spaces
  //ticket{title,description,reporter,ticketPriority} required fields
  //reporter assigned with signedInUserId, and ticketPriorityDefault value is 4(low priority)
  const { title, description, ticketPriority } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Title is required field and is not provided.",
    });
  }
  if (!description) {
    return res.status(400).json({
      success: false,
      message: "Description is required field and is not provided.",
    });
  }

  if (ticketPriority) {
    //if ticket Priority is given, ensure user pick out of available values
    const isTicketPriorityValid = [
      ticketPriorities.low,
      ticketPriorities.medium,
      ticketPriorities.high,
      ticketPriorities.extreme,
    ].includes(Number(ticketPriority));

    if (!isTicketPriorityValid) {
      return res.status(400).json({
        success: false,
        message:
          "Ticket Priorirty value not valid.Allowed values are - 4,3,2,1 indicating low,medium,high,extreme priorites respectively.",
      });
    }
  }
  //all validation passed, pass the control to next
  next();
};
