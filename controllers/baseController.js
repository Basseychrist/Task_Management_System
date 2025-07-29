// controllers/baseController.js
const utilities = require("../routes/utilities");
const baseController = {};

baseController.buildHome = async function (req, res, next) {
  const navigation = await utilities.getNav(req.user);
  res.render("index", { title: "Home", navigation });
};

module.exports = baseController;
