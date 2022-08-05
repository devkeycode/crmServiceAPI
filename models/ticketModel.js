//Ticket schema ->Ticket{title,description,reporter,assignee,createdAt,updatedAt,ticketPriority,ticketStatus}

const mongoose = require("mongoose");
const { ticketPriorities, ticketStauses } = require("../utils/constants");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    ticketPriority: {
      type: Number,
      required: true,
      default: ticketPriorities.low,
      enum: [
        ticketPriorities.low,
        ticketPriorities.medium,
        ticketPriorities.high,
        ticketPriorities.extreme,
      ],
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: ticketStauses.open,
      enum: [ticketStauses.open, ticketStauses.closed, ticketStauses.blocked],
    },
    reporter: {
      type: String,
      required: true,
    },
    assignee: {
      type: String,
    },
  },
  { timestamps: true },
  { versionKey: false }
);

module.exports = mongoose.model("Ticket", ticketSchema);
