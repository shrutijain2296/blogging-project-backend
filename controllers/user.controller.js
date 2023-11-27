const Joi = require('joi');
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Follow = require('../models/Follow');


const BCRYPT_SALTS = Number(process.env.BCRYPT_SALTS);

// POST - Register user
const registerUser = async (req, res) => {
    // Data validation
    const isValid = Joi.object({
        name: Joi.string().required(),
        username: Joi.string().min(3).max(25).alphanum().required(),
        password: Joi.string().min(8).required(),
        email: Joi.string().email().required(),
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Invalid Input",
            data: isValid.error,
        });
    }

    try{
        const userExists = await User.find({ $or: [{ email: req.body.email , username: req.body.username }] });

        if(userExists.length != 0){
            return res.status(400).send({
                status: 400,
                message: "Username/Email already exists",
            })
        }
    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while checking username and email",
            data: err,
        });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_SALTS);

    const userObj = new User({
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword,
        email: req.body.email,
    });

    try{
        await userObj.save();

        return res.status(201).send({
            status: 201,
            message: "User registered successfully",
        });
    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while saving user to DB",
            data: err,
        });
    }
};

// POST - LOGIN USER
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    const isValid = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    }).validate(req.body);

    if(isValid.error){
        return res.status(400).send({
            status: 400,
            message: "Invalid Username/password",
            data: isValid.error,
        });
    }

    // fetch userdata from db
    let userData;
    try{
        userData = await User.findOne({ username });

        if(!userData){
            return res.status(400).send({
                status: 400,
                message: "No user found! Please register",
            });
        }
    }catch(err){
        return res.status(400).send({
            status: 400,
            message: "Error while fetching user data",
            data: err,
        });
    }

    // check if the password user eneterd is same as the password stored in db
    const isPasswordSame = await bcrypt.compare(password, userData.password);

    if(!isPasswordSame){
        return res.status(400).send({
            status: 400,
            message: "Incorrect Password",
        });
    }

    // if password is same - create token to check authentication
    const payload = {
        username: userData.username,
        name: userData.name,
        email: userData.email,
        userId: userData._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    return res.status(200).send({
        status: 200,
        message: "User Logged in successfully!",
        data: { token },
    });
    // token is create to check for authentication
};

    // get all the users
    
    const getAllUsers = async (req, res) => {
        const userId = req.locals.userId;
        // console.log(userId);
        let usersData = [];
        // i should not get response of my own record - $ne - not included
        try{
            usersData = await User.find({ _id: { $ne: userId } });

            if(!usersData){
                return res.status(400).send({
                    status: 400,
                    message: "Failed to fetch all users",
                });
            }
        }catch(err){
            return res.status(400).send({
                status: 400,
                message: "Failed to fetch all users",
                data: err,
            });
        }

        let followingList;
        // find all the records where current user id will be mine, so from there we will get those persons whom i follow
        try{
            followingList = await Follow.find({ currentUserId: userId });
    
        }catch(err){
            return res.status(400).send({
                status: 400,
                message: "Failed to fetch following users list",
                data: err,
            });
        }
        console.log(followingList);
     
        let usersList = [];

        // add follow column to the user whom i follow
        let followingMap = new Map()

        followingList.forEach((user) => {
            followingMap.set(user.followingUserId, true)
        });

        usersData.forEach((user) => {
            if(followingMap.get(user._id.toString())) {
                let userObj = {
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    _id: user._id,
                    follow: true,
                };

                usersList.push(userObj);
            } else{
                let userObj = {
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    _id: user._id,
                    follow: false,
                };

                usersList.push(userObj);
            }
        });
      
        return res.status(200).send({
          status: 200,
          message: "All users fetched succesfully",
          data: usersList,
        });
      };

// also show list of people whom i already follow,
// the person whom i follow- it will have unfollow button next to it and vice versa

 

module.exports = { registerUser, loginUser, getAllUsers };