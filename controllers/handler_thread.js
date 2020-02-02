const Thread = require("../models/schema_thread")

module.exports = class {
  constructor(){
    
  }
  get(thread_id){
    return Thread.findById(thread_id, (err, board) => (err) ? false : board)
  }
  create(text, delete_password){
    let new_thread = new Thread({
      text,
      delete_password
    })
    let error = new_thread.validateSync();
    return (error) ? false : new_thread;
  }
  save(new_thread) {
    let error = new_thread.validateSync();
    return (error) ? false : new_thread.save();
  }
  async delete(thread, delete_password){
    //let thread = await this.get(thread_id);
    //if(!thread) return "thread doesn't exist";
    if(thread.delete_password === delete_password) return thread.deleteOne()
    return false;
  }
  delete_some(arr_of_thread_ids){
    // https://docs.mongodb.com/manual/reference/operator/query/in/
    let conditions = {
      _id: { $in : arr_of_thread_ids}
    }
    return Thread.deleteMany(conditions, (err, record) => (err) ? false : record)
  }
  delete_all(){
    return Thread.deleteMany({}, (err, record) => (err) ? false : record)
  }
  report(thread_id){
    return Thread.findByIdAndUpdate(thread_id, {reported : true}, (err, thread) => (err) ? false : thread)
  }
  async add_reply_ref(thread_id, reply_id){
    let thread = await this.get(thread_id);
    thread.replies = thread.replies.concat([reply_id]);
    return this.save(thread);
  }
  async delete_reply_ref(thread_id, reply_id){
    let thread = await this.get(thread_id);
    let reply_id_position = thread.replies.indexOf(reply_id)
    thread.replies.splice(reply_id_position, 0);
    return this.save(thread);
  }
}