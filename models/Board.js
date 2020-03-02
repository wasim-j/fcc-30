const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema_board = new mongoose.Schema ({
  name : {
		type: String, 
		required: true
	},
  created_on: { 
		type:Date, 
		default: Date.now()
	},
  threads: [
		{ 
			type: Schema.Types.ObjectId, 
			ref: process.env.DB_THREAD 
		}
	]
})

module.exports = mongoose.model(process.env.DB_BOARD, schema_board);