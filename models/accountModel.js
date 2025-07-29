const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  account_firstname: String,
  account_lastname: String,
  account_email: { type: String, unique: true },
  account_password: String,
  account_type: { type: String, default: "Client" },
});

const Account = mongoose.model("Account", accountSchema);

async function registerAccount(firstname, lastname, email, password) {
  const account = new Account({
    account_firstname: firstname,
    account_lastname: lastname,
    account_email: email,
    account_password: password,
  });
  return await account.save();
}

async function checkExistingEmail(email) {
  return await Account.findOne({ account_email: email });
}

async function getAccountByEmail(email) {
  return await Account.findOne({ account_email: email });
}

async function getAccountById(id) {
  try {
    const account = await Account.findById(id);
    // use account
  } catch (err) {
    // handle error
  }
}

async function updateAccountInfo({
  account_id,
  account_firstname,
  account_lastname,
  account_email,
}) {
  return await Account.findByIdAndUpdate(
    account_id,
    { account_firstname, account_lastname, account_email },
    { new: true }
  );
}

async function updateAccountPassword(account_id, hashedPassword) {
  return await Account.findByIdAndUpdate(
    account_id,
    { account_password: hashedPassword },
    { new: true }
  );
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updateAccountPassword,
};
