const express = require("express");
const userRounter = require("./user");
const accountRouter = require("./accout");

const router = express.Router();

router.use("/user", userRounter);
router.use("/account", accountRouter);

module.exports = router;

// /api/v1/user
// /api/v1/transaction