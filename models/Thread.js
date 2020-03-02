const mongoose = require("mongoose");
const Reply = require("./Reply");

const schema_thread = new mongoose.Schema ({
  text: {
		type: String, 
		required: true
	},
  created_on: { 
		type: Date, 
		default: Date.now()
	},
  bumped_on: { 
		type: Date, 
		default: Date.now()
	},
  reported: { 
		type: Boolean,
		default: false, 
	},
  delete_password: {
		type: String, 
		required: true, 
	},
  replies: [Reply]
})

schema_thread.post("deleteOne", async thread => {
  //unpin_thread_from_board(board, thread_ref)
})

async function unpin_thread_from_board(board, thread_ref) {
	// will return true if successful, else false
	

}

module.exports = mongoose.model(process.env.DB_THREAD, schema_thread);