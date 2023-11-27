const mongoose = require("mongoose")
const Schema = mongoose.Schema

const FollowSchema = new Schema({
    // my userId
    currentUserId: {
        type: String,
        require: true,
        ref: "users" //reference of userId will get from users collection
    },
    // following - the person whom I am following
    followingUserId: {
        type: String,
        require: true,
        ref: "users"
    },
    // creationDateTime of when the user started following this person
    creationDateTime: {
        type: String,
        require: true
    },

});

module.exports = mongoose.model("follows", FollowSchema);