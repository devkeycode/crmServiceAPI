//Constants(some fixed value) defined in this file, which can be reused in the project

module.exports = {
  userTypes: {
    admin: "ADMIN",
    engineer: "ENGINEER",
    customer: "CUSTOMER",
  },
  userStatuses: {
    approved: "APPROVED",
    rejected: "REJECTED",
    pending: "PENDING",
  },
  ticketStauses: {
    open: "OPEN",
    closed: "CLOSED",
    blocked: "BLOCKED",
  },
  ticketPriority: {
    low: 4,
    medium: 3,
    high: 2,
    extreme: 1,
  },
};
