const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { ContestParticipation } = require("../models/index");

// Get userId from token (synchronous)
const getUserId = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
}

// Increment fullScreenSwitch
const handleFullScreenChange = async (contestId, token) => {
    const userId = getUserId(token);
    console.log("In violation (fullscreen)", contestId, userId);

    await ContestParticipation.findOneAndUpdate(
        {
            userId,
            contestId
        },
        { $inc: { fullScreenSwitch: 1 } }
    );
}

// Increment tabSwitch
const handleTabSwitch = async (contestId, token) => {
    const userId = getUserId(token);
    console.log("In violation (tab switch)", contestId, userId);

    await ContestParticipation.findOneAndUpdate(
        {
            userId,
            contestId
        },
        { $inc: { tabSwitch: 1 } }
    );
}

module.exports = { handleFullScreenChange, handleTabSwitch };
