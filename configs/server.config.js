if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  PORT: process.env.PORT,
  Notification_Service_URI: process.env.NOTIFICATION_SERVICE_URI,
};
