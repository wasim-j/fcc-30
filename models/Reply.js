const mongoose = require("mongoose");

module.exports = new mongoose.Schema ({
  text: {
		type: String, 
		required: true
	},
  created_on: { 
		type: Date, 
		default: Date.now()
	},
  delete_password: {
		type: String, 
		required: true, 
	},
  reported: { 
		type: Boolean, 
		default: false, 
	}
})