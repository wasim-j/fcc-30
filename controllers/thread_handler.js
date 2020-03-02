const Help = require("./helper.js");

const help = new Help();

module.exports = class  {
	
  async get(req,res) {
    let board_name = req.body.board || req.params.board;
    let threads = await help.get_query(board_name)
    if(!threads) res.json([]);
    res.json(threads);
	}
  
	async post(req,res) {
    let thread = await help.create_thread(req.body.text, req.body.delete_password)
    if(!thread) return res.send("must include text and a delete password");
    
		let board_name = req.body.board || req.params.board;
    let is_thread_pinned_to_board = await help.pin_thread_to_board(board_name, thread._id)
		if(!is_thread_pinned_to_board) {
      await thread.remove()
      return res.send("error: unable to pin your thread to the board")
    }
		
		res.redirect(`/b/${board_name}`);
	}
  
	async put(req,res) {
    let reported = await help.report_thread(req.body.thread_id);
    if(!reported) return res.send("could not report a thread with this thread_id");
    res.send("success");
	}
  
	async del(req,res) {
    let required = req.body.thread_id && req.body.delete_password;
    if(!required) return res.send("required fields missing");
    
    let thread = await help.get_thread_by_id(req.body.thread_id);
    if(!thread) res.send("not deleted: unable to find a thread with thread_id provided");
    if(req.body.delete_password !== thread.delete_password) return res.send("incorrect password");
    
    let unpinned = await help.unpin_thread_from_board(thread._id);
    if(!unpinned) return res.send("could not remove thread_ref from board");
    
    let thread_deleted = await thread.remove().then(product => product).catch(err => false);
    if(!thread_deleted) return res.send("unable to delete the thread");
  
    res.send("success");
	}
}