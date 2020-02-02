const Board = require("../models/schema_board")

module.exports = class {
  constructor(){
    
  }
  get(name){
    return Board.findOne({name}, (err, board) => (err) ? false : board)
  }
  get_all(){
    return Board.find({}, (err, board) => (err) ? false : board)
  }
  create(name){
    let new_board = new Board({
      name, 
      threads: []
    })
    let error = new_board.validateSync();
    return (error) ? false : new_board;
  }
  save(new_board){
    let error = new_board.validateSync();
    return (error) ? false : new_board.save();
  }
  delete(board_id){
    return Board.deleteOne({_id: board_id}, (err, board) => (err) ? false : board);
  }
  delete_all(){
    return Board.deleteMany({}, (err, record) => (err) ? false : record)
  }
  async add_thread_ref(board_name, thread_id){
    let board = await this.get(board_name);
    if(!board) board = this.create(board_name);
    board.threads = board.threads.concat([thread_id]);
    return this.save(board);
  }
  async delete_thread_ref(board_id, thread_id){
    let board = await this.get(board_id);
    let thread_id_position = board.replies.indexOf(thread_id)
    board.replies.splice(thread_id_position, 0);
    return this.save(board);
  }
}