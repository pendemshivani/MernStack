const express = require("express");
const cors = require("cors");
const app = express();
const mainRouter = require("./routes/index");

app.use(cors());
app.use(express.json());


app.use("/api/v1", mainRouter);

app.listen(5000);

// /api/v1/user/signup
// /api/v1/user/signin
// /api/v1/user/changePassword

// /api/v1/account/transferMoney
// /api/v1/account/balance
