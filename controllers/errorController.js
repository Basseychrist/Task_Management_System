exports.triggerError = (req, res, next) => {
  const err = new Error("This is an intentional server error for testing.");
  err.status = 500;
  next(err);
};