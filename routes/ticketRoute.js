//this file contains the logic for addressing/managing the  requests related to Ticket resource

const ticketController = require("../controllers/ticketController");
const { verifyToken, validateTicketRequestBody } = require("../middlewares");


module.exports = (app) => {
  //create a ticket
  app.post(
    "/crmService/api/v1/tickets",
    [verifyToken, validateTicketRequestBody],
    ticketController.create
  );
};
