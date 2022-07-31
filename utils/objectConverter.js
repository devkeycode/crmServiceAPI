//This util function used to convert the object, in short sending only required values in the user object and excluding the unwanted (like user password) from sending,so filtering the userResponse object.

const filterUserResponse = (userObj) => {
  const { name, email, userId, userType, userStatus } = userObj;
  return { name, email, userId, userType, userStatus };
};

module.exports = { filterUserResponse };
