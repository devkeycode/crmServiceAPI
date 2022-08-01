//this file contains the logic for handling the Ticket Resource

const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");
const { userTypes, userStatuses } = require("../utils/constants");

//create Ticket
exports.create = async (req, res) => {
  const { title, description, ticketPriority } = req.body;

  const ticketObj = {
    title: title,
    description: description,
    reporter: req.userId, //will get from calling verifyToken middleware
    ticketPriority: ticketPriority,
  };

  //to assign an engineer at first, will have to fetch the engineer having least number of tickets  assigned
  try {
    //get the list of engineers in the system
    const engineersList = await User.find({
      userType: userTypes.engineer,
      userStatus: userStatuses.approved,
    });

    if (engineersList.length == 0) {
      //no engineer is there in the sytem at present,so assign null as ticket assignee, so later admin can approve some engineers and assign one of them
      ticketObj.assignee = null;
    } else {
      //pick up the engineer with lowest assigned ticket count
      let minimumTicketsAssignedCount = Number.MAX_SAFE_INTEGER;
      let potentialAssignee;
      for (let engineer of engineersList) {
        let engineerAssignedTicketCount = engineer.ticketsAssigned.length;
        if (engineerAssignedTicketCount < minimumTicketsAssignedCount) {
          //update
          potentialAssignee = engineer;
          minimumTicketsAssignedCount = engineerAssignedTicketCount;
        }
      }

      //assign the ticket to engineer(potentialAssignee) thru userId
      ticketObj.assignee = potentialAssignee.userId;
    }
    //create the ticket
    const ticketCreated = await Ticket.create(ticketObj);

    if (ticketCreated) {
      //if ticketCreated successfully, then need to update the ticketsCreated and ticketsAssigned field in the respective related user document

      //update the ticketsCreated field for the user who created this ticket
      const user = await User.findOne({ userId: req.userId });
      user.ticketsCreated.push(ticketCreated._id);

      await user.save();

      if (ticketCreated.assignee !== null) {
        //means an engineer is assinged the ticket,so update the ticketsAssigned field for that engineer
        const engineer = await User.findOne({
          userId: ticketCreated.assignee,
        });
        engineer.ticketsAssigned.push(ticketCreated._id);
        await engineer.save();
      }

      return res.status(201).json({
        success: true,
        message: "Ticket successfully created.",
      });
    }
  } catch (error) {
    console.log("Error while ticket creation", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
