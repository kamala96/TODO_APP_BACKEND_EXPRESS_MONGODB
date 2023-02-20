const mongoose = require("mongoose");
const TodoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide an to do list name!"],
        unique: [true, "To do exist"],
    },

    description: {
        type: String,
        required: true,
        unique: false,
    },

    status: {
        type: Boolean,
        required: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
},
    { timestamps: true }
)

module.exports = mongoose.model.Todo || mongoose.model("Todo", TodoSchema);