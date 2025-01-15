
const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { authMiddleware } = require("../middleware");

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

// Signup Schema
const signupSchema = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string(),
});

// Signup Route
router.post("/signup", async (req, res) => {
    try {
        const obj = signupSchema.safeParse(req.body);
        if (!obj.success) {
            return res.status(400).json({ message: "Invalid inputs for signup!" });
        }

        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists!" });
        }

        const newUser = await User.create(req.body);
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);

        await Account.create({
            userId: newUser._id,
            balance: 1 + Math.random() * 10000,
        });

        res.status(201).json({ message: "User created successfully!", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Signin Schema
const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
});

// Signin Route
router.post("/signin", async (req, res) => {
    try {
        const obj = signinSchema.safeParse(req.body);
        if (!obj.success) {
            return res.status(400).json({ message: "Invalid signin inputs!" });
        }

        const user = await User.findOne(req.body);
        if (user) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET);
            return res.json({ token });
        }

        res.status(401).json({ message: "Invalid username or password." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Update Schema
const updateSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

// Update Route
router.put("/", authMiddleware, async (req, res) => {
    try {
        const obj = updateSchema.safeParse(req.body);
        if (!obj.success) {
            return res.status(400).json({ message: "Invalid inputs for update!" });
        }

        await User.updateOne({ _id: req.user.userId }, req.body);
        res.json({ message: "User updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Bulk Users Fetch Route
router.get("/bulk", async (req, res) => {
    try {
        const filter = req.query.filter || "";
        const users = await User.find({
            $or: [
                { firstName: { $regex: filter, $options: "i" } },
                { lastName: { $regex: filter, $options: "i" } },
            ],
        });

        res.json({
            users: users.map((user) => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id,
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
});

module.exports = router;
