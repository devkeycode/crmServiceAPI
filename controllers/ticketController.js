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
    //default sort method of mongoose can also be used for sorting engineer based on ticketsWorkingOnCount
    const engineersList = await User.find({
      userType: userTypes.engineer,
      userStatus: userStatuses.approved,
    });

    if (engineersList.length == 0) {
      //no engineer is there in the sytem at present,so assign null as ticket assignee, so later admin can approve some engineers and assign one of them
      ticketObj.assignee = null;
    } else {
      //pick up the engineer with lowest ticketsworkingOnCount by sorting the enginenerList in non-decreasing order
      engineersList.sort(
        (a, b) => a.ticketsWorkingOnCount - b.ticketsWorkingOnCount
      );
      let potentialAssignee = engineersList[0]; //pick up the very first engineer after sorting
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
        //means an engineer is assinged the ticket,so update the ticketsAssigned field for that engineer and also increase the ticketsWorkingOnCount
        const engineer = await User.findOne({
          userId: ticketCreated.assignee,
        });
        engineer.ticketsAssigned.push(ticketCreated._id);
        engineer.ticketsWorkingOnCount += 1;
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

//fetch all tickets
//admin userType->can get all the tickets
//customer userType-> can get all the ticketsCreated by the given user
//Engineer userType -> can get all the ticketsCreated by the user and ticketsAssigned to the user
exports.findAllTickets = async (req, res) => {
  //get the signedIn User detail/role
  const user = await User.findOne({ userId: req.userId });
  const queryObject = {};
  const ticketsCreated = user.ticketsCreated; //ticketIds array
  const ticketsAssigned = user.ticketsAssigned;

  switch (user.userType) {
    case userTypes.customer:
      //only ticketsCreated by the user, can get {_id: {$in:ticketsCreated}}
      if (ticketsCreated.length === 0) {
        return res.status(200).json({
          success: true,
          tickets: [],
          message: "No tickets created by the user yet.",
        });
      }
      queryObject["_id"] = { $in: ticketsCreated };
      break;
    case userTypes.engineer:
      //get all tickets assigned and created by the user
      //{$or:[{_id:{$in:ticketsCreated}},{_id:{$in:ticketsAssigned}}]
      queryObject["$or"] = [
        { _id: { $in: ticketsCreated } },
        { _id: { $in: ticketsAssigned } },
      ];
      break;
    default:
      //admin can queryAll tickets,so queryObject will be remain same {}
      break;
  }

  //if optional queryParam passed along with the request,then add them to the queryObject
  if (req.query) {
    addOptionalQueries(req, queryObject);
  }

  // console.log(queryObject);

  try {
    const tickets = await Ticket.find(queryObject);
    return res.status(200).json({
      success: true,
      documentResultsCount: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error("Error while searching ticket", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//Get a single ticket based on ticket Id
//ADMIN usertype can access all the tickets
//ENGINEER usertype can only access those tickets having ownership(either as assignee or created)
//CUSTOMER usertype can access only those tickets created by the user
exports.findByTicketId = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error while searching ticket", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 *
 * @param {*} req
 * @param {*} queryObject
 * @Description Function to add optional query parameter(if passed) to the query Object
 */
function addOptionalQueries(req, queryObject) {
  if (req.query.status) {
    queryObject.status = req.query.status;
  }
  if (req.query.reporter) {
    queryObject.reporter = req.query.reporter;
  }
  if (req.query.assignee) {
    queryObject.assignee =
      req.query.assignee.toLowerCase() === "null" ? null : req.query.assignee;
  }
  if (req.query.ticketPriority) {
    queryObject.ticketPriority = req.query.ticketPriority;
  }
  if (req.query.title) {
    //will get all the title containing the given text (in request query title)
    //new RegExp(expression,flags)
    let regexp = new RegExp(`${req.query.title}`, "i");
    queryObject.title = { $regex: regexp };
  }
  if (req.query.description) {
    //will get all the description containing the given text (in request query description)
    let regexp = new RegExp(`${req.query.description}`, "i");
    queryObject.description = { $regex: regexp };
  }
}
