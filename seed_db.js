const Help = require("./controllers/helper");

const help = new Help();

async function add_threads(board_name, num_of_threads=11, num_of_replies=4){
  let time_start = Date.now();
  for(let i = 0; i < num_of_threads; i++){
    await add_thread(`mythread${i}`, `pwd${i}`, board_name, num_of_replies);
  }
  //console.log(`time taken to seed: ${Date.now() - time_start}`);
  return help.get_board(board_name);
}

async function add_thread(text, pwd, board_name, num_of_replies){
  let thread = await help.create_thread(text, pwd);
  thread = await add_replies(thread, num_of_replies);
  
  await help.pin_thread_to_board(board_name, thread._id);
}

function add_replies(thread, num_of_replies){
  for(let i = 0; i < num_of_replies; i++){
    add_reply(`myreply${i}`, `pwd${i}`, thread);
  }
  return thread.save();
}

function add_reply(text, pwd, thread){
  let reply = {
    text,
    delete_password: pwd
  }
  thread.replies.push(reply);
  thread.bumped_on = Date.now();
}

module.exports = add_threads;