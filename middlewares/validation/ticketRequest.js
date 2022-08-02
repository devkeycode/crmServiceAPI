//this middleware file contains the logic to validate ticket  request body(during ticket creation) ,and if request body validated then only pass the control to the next function

const Ticket = require("../../models/ticketModel");
const User = require("../../models/userModel");
const trimValuesInRequestBody = require("../../utils/trimRequestBody");
const {
  ticketPriorities,
  ticketStauses,
  userTypes,
  userStatuses,
} = require("../../utils/constants");

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

  if (ticketPriority && !isTicketPriorityValid(ticketPriority)) {
    return res.status(400).json({
      success: false,
      message:
        "Ticket Priorirty value not valid.Allowed values are - 4,3,2,1 indicating low,medium,high,extreme priorites respectively.",
    });
  }

  //all validation passed, pass the control to next
  next();
};

exports.validateTicketUpdateRequestBody = async (req, res, next) => {
  //remove unwanted spaces from the request body
  trimValuesInRequestBody(req);

  const { title, description, ticketPriority, status, assignee } = req.body;

  if (title === "") {
    return res.status(400).json({
      success: false,
      message: "Title can't be empty string.",
    });
  }
  if (description === "") {
    return res.status(400).json({
      success: false,
      message: "Description can't be empty string.",
    });
  }

  if (ticketPriority !== undefined && !isTicketPriorityValid(ticketPriority)) {
    //if ticket Priority is given, ensure user pick out of available values
    return res.status(400).json({
      success: false,
      message:
        "Ticket Priorirty value not valid.Only these number values are allowed - 4,3,2,1 indicating low,medium,high,extreme priorites respectively.",
    });
  }

  if (status !== undefined && isTicketStatusValid(status) == false) {
    return res.status(400).json({
      success: false,
      message:
        "Ticket Status value not valid.Allowed values are - OPEN,CLOSED,BLOCKED.",
    });
  }

  if (assignee) {
    try {
      const user = await User.findOne({ userId: req.userId });
      //check whether the requestedUser is adminUserType or not(as only admin is allowed to update the assignee)
      if (user.userType !== userTypes.admin) {
        return res.status(403).json({
          success: false,
          message:
            "Access Forbidden. Admin is only allowed to reassign a ticket.",
        });
      }
      //check whether the assignee in the requested body is valid user of engineerType and having  approved status
      const engineer = await User.findOne({
        userId: assignee,
        userType: userTypes.engineer,
        userStatus: userStatuses.approved,
      });
      if (engineer == null) {
        return res.status(400).json({
          success: false,
          message: "Assignee is not a valid approved engineer.",
        });
      }

      //now ensure is admin, passing both the status and assignee in a single request , then return as restriction

      if (assignee && status) {
        return res.status(400).json({
          success: false,
          message:
            "Restriction on the system- Ticket Status and assignee Change not allowed in a single request.Either pass one of them.",
        });
      }
    } catch (error) {
      console.error("Error while acessing info", error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  next(); //all validation passed,pass the control
};

/**
 *
 * @param {Number} ticketPriorityNumber
 * @returns {Boolean} true or false
 * @Description checks whether the given TicketPriority is valid or not
 */
function isTicketPriorityValid(ticketPriorityNumber) {
  const ticketPrioritiesList = [
    ticketPriorities.low,
    ticketPriorities.medium,
    ticketPriorities.high,
    ticketPriorities.extreme,
  ];

  return ticketPrioritiesList.includes(ticketPriorityNumber);
}

/**
 *
 * @param {String} ticketStatus
 * @returns {Boolean} true or false
 * @Description checks whether the given Ticketstatus is valid or not
 */
function isTicketStatusValid(ticketStatus) {
  const ticketStatusesList = [
    ticketStauses.open,
    ticketStauses.blocked,
    ticketStauses.closed,
  ];

  return ticketStatusesList.includes(ticketStatus);
}
