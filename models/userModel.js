//User schema-> User{name,userId,email,password,userType,userStatus,createdAt}

const mongoose = require("mongoose");
const { userType, userStatus } = require("../utils/constants");

const userSchema = new mongoose.Schema({
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
    default: userType.customer,
    enum: [userType.admin, userType.engineer, userType.customer],
  },
  userStatus: {
    type: String,
    default: userStatus.approved,
    enum: [userStatus.approved, userStatus.rejected, userStatus.pending],
  },
});

module.exports = mongoose.model("User", userSchema);
