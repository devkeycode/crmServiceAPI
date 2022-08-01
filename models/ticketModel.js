//Ticket schema ->Ticket{title,description,reporter,assignee,createdAt,updatedAt,ticketPriority,ticketStatus}

const mongoose = require("mongoose");
const { ticketPriority, ticketStauses } = require("../utils/constants");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    ticketPriority: {
      type: Number,
      required: true,
      default: ticketPriority.low,
      enum: [
        ticketPriority.low,
        ticketPriority.medium,
        ticketPriority.high,
        ticketPriority.extreme,
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
    createdAt: {
      type: Date,
      default: () => {
        return Date.now();
      },
      immutable: true,
    },
    updatedAt: {
      type: Date,
      default: () => {
        return Date.now();
      },
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Ticket", ticketSchema);
