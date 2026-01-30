module.exports = (req, res, next) => {
  res.success = (data = null, message = "OK", statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.fail = (message = "Something went wrong", statusCode = 500, errors = []) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  };

  next();
};
