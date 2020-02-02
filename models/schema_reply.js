const mongoose = require("mongoose");
const Handler_Thread = require("../controllers/handler_thread")

//  _id, text, created_on, delete_password, & reported

const schema_reply = new mongoose.Schema ({
  text: {type: String, required: true},
  created_on: { type:Date, default: Date.now()},
  delete_password: {type: String, required: true},
  reported: { type:Boolean, default: false}
})

schema_reply.post("deleteOne", async (reply) => {
  // remove reply_id from thread
  let handler_thread = new Handler_Thread();
  await handler_thread.delete_reply_ref(reply._id)
})

module.exports = mongoose.model(process.env.DB_REPLY, schema_reply);