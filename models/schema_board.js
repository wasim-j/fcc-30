const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Handler_Thread = require("../controllers/handler_thread")

const schema_board = new mongoose.Schema ({
  name : {type: String, required: true},
  created_on: { type:Date, default: Date.now()},
  threads: [{ type: Schema.Types.ObjectId, ref: process.env.DB_THREAD }]
})

schema_board.post("deleteOne", async board => {
  // remove refed threads from the thread model
  if(board.threads.length >= 1) {
    let handler_thread = new Handler_Thread();
    await handler_thread.delete_some(board.threads);
  }
})

module.exports = mongoose.model(process.env.DB_BOARD, schema_board);