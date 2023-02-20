const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: [true, "Please provide first name!"],
        unique: [true, "First Name Exist"],
    },

    lname: {
        type: String,
        required: [true, "Please provide last name!"],
        unique: [true, "Lastt Name Exist"],
    },

    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
    },

    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
})

module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);