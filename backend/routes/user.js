const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
// const JWT_SECRET = require("../config");
const { authMiddleware } = require("../middleware");

const JWT_SECRET = "yourjwtsecret";

// signup and signin

const signupSchema = zod.object({
    username: zod.string().email(),
	firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string()
})

router.post("/signup", async (req, res)=>{
    const obj = signupSchema.safeParse(req.body);
    if(!obj.success){
        return res.status(411).json({
            message: "Incorrect Inputs!"
        })
    }
    const user = await User.findOne({
        username: req.body.username,
    })
    console.log(user);
    if(user){
        return res.status(411).json({
            message: "User Already Exist!"
        })
    }
    const newUser = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });
    const userId = newUser._id;
    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })
    const token = jwt.sign({
        userId
    }, JWT_SECRET);
    res.json({
        message: "User Created Successfull!",
        token: token
    })
})

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async(req, res)=>{
    const {success} = signinSchema.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "User doesn't Exist with this inuts!"
        })
    }
    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });
    if(user){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
        res.json({
            token: token
        })
        return;
    }
    res.status(411).json({
        message: "Error while logging in!"
    })
})

const updateSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/", authMiddleware, async(req, res)=>{
    const {success} = updateSchema.safeParse(req.body)
    if(!success){
        res.status(411).json({
            message: "Error while updating information"
        })
    }
    await User.updateOne(req.body, {
        _id: myCurrentId
    })
    res.json({message: "Updated successfully"})
})

router.get("/bulk", async(req, res)=>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        },{
            lastName: {
                "$regex": filter
            }
        }]
    })
    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router