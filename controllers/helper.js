const mongoose = require("mongoose");
const Board = require("../models/Board");
const Thread = require("../models/Thread");

module.exports = class {
  drop_boards() {
    return Board.deleteMany({})
  }
  drop_threads() {
    return Thread.deleteMany({})
  }
  validate_and_save(new_document){
    let error = new_document.validateSync();
    if(error) return false;
    return new_document.save();
  }
  async create_board(board_name) {
    let new_board = new Board({
      name: board_name
    })
    return await this.validate_and_save(new_board);
  }
  
  async create_thread(text, delete_password) {
    let new_thread = new Thread({
      text,
      delete_password
    })
    return await this.validate_and_save(new_thread);
  } 
  create_reply(text, delete_password) {
    let valid_text = typeof text === "string";
    let valid_delete_password = typeof delete_password === "string"
    if(!valid_text || !valid_delete_password) return false;
    return {
      text,
      delete_password
    }
  } 
  get_board(board_name){
    return Board.findOne({name: board_name}).lean().then( result => result).catch(err => false);
  }
  get_thread_by_id(thread_id){
    return Thread.findById(thread_id).then( result => result).catch(err => false);
  }
  pin_thread_to_board(board_name, thread_ref) {
    thread_ref = new mongoose.Types.ObjectId(thread_ref);
    let conditions = { name: board_name}
    let update = {
      $addToSet: {
        threads: thread_ref
      }
    };
    let options = {
      new: true,
      upsert: true
    };
    return Board.findOneAndUpdate(conditions, update, options).then( result => result).catch(err => false);
  }
  unpin_thread_from_board(thread_ref){
    //https://stackoverflow.com/questions/33369198/mongoose-returning-null-on-findoneandupdate?rq=1
    thread_ref = new mongoose.Types.ObjectId(thread_ref);
    let conditions = {threads: thread_ref};
    let update = {
      $pull: {
        threads: thread_ref
      }
    };
    let options = {new: true};
    return Board.findOneAndUpdate(conditions, update, options).then( result => result).catch(err => false);
  }
  report_thread(thread_id){
    let update = {reported : true};
    let options = {new: true}
    return Thread.findByIdAndUpdate(thread_id, update, options).then( result => result).catch(err => false);
  }
  get_board(board_name){
    let pop = {path: "threads"}
    return Board.findOne({name: board_name}).populate(pop).lean();
  }
  get_query(board_name){
    let pop = { 
      path: 'threads',
      select: "-reported -delete_password",
      options: { sort: { bumped_on: -1 } },
      perDocumentLimit: 10
    };
    
    return Board.findOne({name: board_name})
      .populate(pop)
      .map( board => board.threads)
      .lean()
      .then(threads => {
        if(threads.length === 0) return threads;
        return threads = threads.map( thread => {
          thread.replycount = thread.replies.length;
          if(thread.replies === 0) return thread;
          if(thread.replies.length > 3) thread.replies = thread.replies.slice(0,3);
          thread.replies = this.clean_replies(thread.replies);
          
          return thread;
        });
      })
      .catch( err => false);
  }
  get_query_thread(thread_id){
    return Thread.findById(thread_id)
      .select("-reported -delete_password")
      .lean()
      .then( thread => {
        if(thread.replies === 0) return thread;
        thread.replies = this.clean_replies(thread.replies);
        return thread;
      })
      .catch( err => false);
    
  }
  clean_replies(replies){
    return replies.map(reply => {
      delete reply.reported;
      delete reply.delete_password;
      return reply;
    })
  }
  
  
}






