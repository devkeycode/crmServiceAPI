exports.validateSignInRequestBody = (req, res, next) => {
  const { userId, password } = req.body;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "UserId is required field and is not provided.",
    });
  }
  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required field and is not provided.",
    });
  }
  //all validation passed, so pass the control to next function (usually controller)or next middleware.
  next();
};
