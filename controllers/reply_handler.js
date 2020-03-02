const Help = require("./helper.js");

const help = new Help();

module.exports = class {
	async get(req,res) {
    let thread_id = req.query.thread_id;
    let thread = await help.get_query_thread(thread_id);
    res.json(thread)
	}
	async post(req,res) {
		let reply = help.create_reply(req.body.text, req.body.delete_password);
    //console.log(reply)
    if(!reply) return res.send("must include text and a delete password");
    let thread = await help.get_thread_by_id(req.body.thread_id);
    if(!thread) return res.send("thread_id is invalid");
    thread.bumped_on = reply.created_on;
    thread.replies.push(reply);
    await thread.save();
    let board_name = req.body.board || req.params.board;
    
    res.redirect(`/b/${board_name}/${thread._id}`);
	}
	async put(req,res) {
    let thread = await help.get_thread_by_id(req.body.thread_id);
    if(!thread) return res.send("thread_id is invalid");
    let reply_index = thread.replies.findIndex( reply => reply._id.toString() === req.body.reply_id);
    if(reply_index < 0) return res.send("reply_id does not exist in specified thread");
    thread.replies[reply_index].reported = true;
    await thread.save();
    
    res.send("success");
	}
	async del(req,res) {
    let thread = await help.get_thread_by_id(req.body.thread_id);
    if(!thread) return res.send("thread_id is invalid");
    let reply_index = thread.replies.findIndex( reply => reply._id.toString() === req.body.reply_id);
    if(reply_index < 0) return res.send("reply_id does not exist in specified thread");
    let pwd = thread.replies[reply_index].delete_password;
    if(pwd !== req.body.delete_password) return res.send("incorrect password");
    thread.replies[reply_index].text = "[deleted]"
    await thread.save();
    res.send("success");    
	}
}