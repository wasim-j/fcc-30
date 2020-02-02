const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Handler_Board = require("../controllers/handler_board");
const Handler_Reply = require("../controllers/handler_reply");
// _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on), reported(boolean), delete_password, & replies(array)

const schema_thread = new mongoose.Schema ({
  text: {type: String, required: true},
  created_on: { type:Date, default: Date.now()},
  bumped_on: { type:Date, default: Date.now()},
  reported: { type:Boolean, default: false},
  delete_password: {type: String, required: true},
  replies: [{ type: Schema.Types.ObjectId, ref: process.env.DB_REPLY}]
})

schema_thread.post("deleteOne", async (thread, next) => {
  // remove thread_id from board
    // if i had a board prop in this schema I would have a link with the board and could search for the board easily
    // I don't want to create a board prop in the schema since this is not asked for in the 4th user story
    // instead will run a query:
      // all boards
      // each board that contain a threads array that contains this thread id
  
        // possible: 
  let handler_board = new Handler_Board();
  let board = handler_board.get_all().where(thread._id).in("threads")
  
    // for each board returned that contains this thread id in their threads array
      // remove thread_id from board thread array
      // save board
  // await handler_board.delete_thread_ref(board._id, thread._id)
  next();
})

schema_thread.post("deleteOne", async thread => {
  // remove refed replies from the reply model
  if(thread.replies.length >= 1) {
    let handler_reply = new Handler_Reply();
    await handler_reply.delete_some(thread.replies);
  }
})

module.exports = mongoose.model(process.env.DB_THREAD, schema_thread);