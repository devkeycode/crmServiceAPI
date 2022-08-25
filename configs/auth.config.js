if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  secret: process.env.JWT_SECRET_KEY,
  expiryPeriod: process.env.JWT_EXPIRY_PERIOD,
};
