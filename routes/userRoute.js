//this file contains the logic for addressing the  requests related to User resource

const userController = require("../controllers/userController");
const {
  verifyToken,
  isAdmin,
  isAdminOrOwner,
  isValidUserIdInReqParam,
} = require("../middlewares");

module.exports = (app) => {
  //get all the users
  app.get(
    "/crmService/api/v1/users",
    [verifyToken, isAdmin],
    userController.findAllUsers
  );

  //get a single user by id
  app.get(
    "/crmService/api/v1/users/:id",
    [verifyToken, isValidUserIdInReqParam, isAdminOrOwner],
    userController.findByUserId
  );

  //update user
  app.put(
    "/crmService/api/v1/users/:id",
    [verifyToken, isValidUserIdInReqParam, isAdminOrOwner],
    userController.update
  );
};
