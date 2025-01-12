const express = require("express");
const mongoose = require("mongoose");
const { authMiddleware } = require("../middleware");
const { Account, User } = require("../db");


const router = express.Router();

router.get("/balance", authMiddleware, async (req, res)=>{
    const account = await Account.findOne({
        userId: myCurrentId
    });
    res.json({
        balance: account.balance
    })
})

router.post("/transfer", authMiddleware, async (req, res)=>{
    const session = await mongoose.startSession();
    session.startTransaction();
    const {amount, to} = req.body;
    const account = await Account.findOne({userId: myCurrentId}).session(session);
    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient Balance"
        });
    }
    const toAccount = await Account.findOne({userId: to }).session(session);
    if (!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid account"
        });
    }
    await Account.updateOne(
        {
            userId: myCurrentId
        },
        {
            $inc: {
                balance: -amount
            }
        }
    ).session(session);

    await Account.updateOne(
        {
            userId: to
        },
        {
            $inc: {
                balance: amount
            }
        }
    ).session(session);

    await session.commitTransaction();
    res.json({
        message: "Transaction Completed"
    });
})

module.exports = router;