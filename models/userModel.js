//User schema-> User{name,userId,email,password,userType,userStatus,createdAt,}

const mongoose = require("mongoose");
const { userTypes, userStatuses } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      minLength: 5,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
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
    userType: {
      type: String,
      default: userTypes.customer,
      enum: [userTypes.admin, userTypes.engineer, userTypes.customer],
    },
    userStatus: {
      type: String,
      default: userStatuses.approved,
      enum: [
        userStatuses.approved,
        userStatuses.rejected,
        userStatuses.pending,
      ],
    },
    ticketsCreated: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "Ticket",
    },
    ticketsAssigned: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "Ticket",
    },
    ticketsWorkingOnCount: {
      type: Number,
      default: 0,
    }, //make count of tickets working on,when ticket assigned to an engineer increase count by 1,and whenever tickets get closed or blocked(other than Open status) or ticket reassigned to other engineer, decrease the count from the respective engineer and increase the other(in case of updation),any new ticket may be assigned to an engineer with less ticketsWorkingOn initially
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
