const Reply = require("../models/schema_reply");

module.exports = class {
  constructor(){
    
  }
  get(reply_id){
    return Reply.findById(reply_id, (err, board) => (err) ? false : board)
  }
  create(text, delete_password){
    let new_reply = new Reply({
      text,
      delete_password
    })
    let error = new_reply.validateSync();
    return (error) ?  false : new_reply;
  }
  save(new_reply) {
    let error = new_reply.validateSync();
    return (error) ? false : new_reply.save();
  }
  delete(reply, delete_password){
    if(reply.delete_password === delete_password) return reply.deleteOne()
    return false;
  }
  delete_some(arr_of_reply_ids){
    // https://docs.mongodb.com/manual/reference/operator/query/in/
    let conditions = {
      _id: { $in : arr_of_reply_ids}
    }
    return Reply.deleteMany(conditions, (err, record) => (err) ? false : record)
  }
  delete_all(){
    return Reply.deleteMany({}, (err, record) => (err) ? false : record)
  }
  report(reply_id){
    return Reply.findOneAndUpdate({_id: reply_id}, {reported : true}, (err, reply) => (err) ? false : reply)
  }
}