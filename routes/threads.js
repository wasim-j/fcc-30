const Handler_Board = require("../controllers/handler_board");
const Handler_Thread = require("../controllers/handler_thread");

module.exports = app => {
  
  let handler_board = new Handler_Board();
  let handler_thread = new Handler_Thread();
  
  app.route('/api/threads/:board')
    .get(async (req,res) => {
      let board = await handler_board.get(req.params.board);
      if(board.threads.length === 0) return res.json([]);
      
    })
    .post(async(req,res) => {
      let board_name = req.body.board || req.params.board;
      let required = board_name && req.body.text && req.body.delete_password
      if(!required) return res.send("required fields missing");
      
      let thread = handler_thread.create(req.body.text, req.body.delete_password);
      thread = await handler_thread.save(thread);
      let board = await handler_board.add_thread_ref(board_name, thread._id);
      board = await handler_board.save(board);
       
      
      res.json({board, thread})
      //res.redirect(process.cwd() + `/b/${board_name}`);
      
    })
    .put(async (req,res) => {
      if(!req.body.thread_id) res.send("thread_id required");
      let reported = await handler_thread.report(req.body.thread_id);
      (reported) ? res.send("successful") : res.send("unsuccessful") 
    })
    .delete(async (req,res) => {
      let required = req.body.thread_id && req.body.delete_password;
      if(!required) return res.send("required fields missing");
    
      let thread = await handler_thread.get(req.body.thread_id)
      if(!thread) return res.send("thread doesn't exist");
    
      let deleted = handler_thread.delete(thread, req.body.delete_password);
      (deleted) ? res.send("successful") : res.send("incorrect password") 
    })
}