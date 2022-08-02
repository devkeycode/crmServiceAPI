//this file contains the logic for addressing/managing the  requests related to Ticket resource

const ticketController = require("../controllers/ticketController");
const {
  verifyToken,
  validateTicketRequestBody,
  isValidTicketIdInReqParam,
  isHavingValidTicketRights,
} = require("../middlewares");

module.exports = (app) => {
  //create a ticket
  app.post(
    "/crmService/api/v1/tickets",
    [verifyToken, validateTicketRequestBody],
    ticketController.create
  );
  //fetch all tickets
  app.get(
    "/crmService/api/v1/tickets",
    [verifyToken],
    ticketController.findAllTickets
  );
  //fetch ticket based on ticketId
  app.get(
    "/crmService/api/v1/tickets/:id",
    [verifyToken, isValidTicketIdInReqParam, isHavingValidTicketRights],
    ticketController.findByTicketId
  );
};
