const MongoDb = require("mongodb")
const chai = require('chai');
const assert = chai.assert;

const Handler_Board = require("../controllers/handler_board");
const Handler_Thread = require("../controllers/handler_thread");
const Handler_Reply = require("../controllers/handler_reply");

suite('Unit Tests', () => {
  
  let handler_board = new Handler_Board();
  let handler_thread = new Handler_Thread();
  let handler_reply = new Handler_Reply();
  
  after( async () => {
    await handler_board.delete_all();
    await handler_thread.delete_all();
    await handler_reply.delete_all();
  });

  suite("handler_thread", () => {
    
    let test_thread = null;
    
    test("create_thread", async () => {
      let new_thread = handler_thread.create("my text", "password");
      assert.isTrue(new_thread.isNew);
      assert.property(new_thread, "_id")
      let thread = await handler_thread.save(new_thread)
      assert.isFalse(thread.isNew);
      
      thread = await handler_thread.add_reply_ref(thread._id,MongoDb.ObjectId());
      thread = await handler_thread.add_reply_ref(thread._id,MongoDb.ObjectId());
      assert.equal(thread.replies.length, 2)
      
      test_thread = thread;
    })
    
    test("get thread", async()=> {
      let thread = await handler_thread.get(test_thread._id);
      assert.property(thread, "_id");
      assert.equal(thread.text, "my text");
      assert.equal(thread.delete_password, "password");
      
    })
    
    test("report thread", async()=> {
      let thread = await handler_thread.report(test_thread._id);
      assert.property(thread, "_id")
      assert.equal(thread.text, "my text");
      assert.isTrue(thread.reported);
    })
    
    test("delete thread", async()=> {
      let deleted_thread = await handler_thread.delete(test_thread, test_thread.delete_password);
      let thread = await handler_thread.get(test_thread._id)
      assert.isNull(thread);
    })    
    
  })
  
  suite("handler_reply", () => {
    
    let test_reply = null;
    
    test("create reply", async () => {
      let new_reply = handler_reply.create("my reply text", "password");
      assert.isTrue(new_reply.isNew);
      assert.property(new_reply, "_id")
      let reply = await handler_reply.save(new_reply)
      assert.isFalse(reply.isNew);
      test_reply = reply;
    })
    
    test("get reply", async () => {
      let reply = await handler_reply.get(test_reply._id);
      assert.property(reply, "_id");
      assert.equal(reply.text, "my reply text");
      assert.equal(reply.delete_password, "password");
    })
    
    test("report reply", async() => {
      let reply = await handler_reply.report(test_reply._id);
      assert.property(reply, "_id")
      assert.equal(reply.text, "my reply text");
      assert.isTrue(reply.reported);
    })
    
    test("delete reply", async () => {
      let deleted_reply = await handler_reply.delete(test_reply, test_reply.delete_password);
      let reply = await handler_reply.get(test_reply._id)
      assert.isNull(reply);
    })
  })
  
  suite("clean up" , ()=> {
    
    suite("deleting a reply", ()=> {
      
      test("should delete reply ref in the thread")
      
    })
    
    suite("deleting a thread", ()=> {
      
    })
    
    suite("deleting a board", ()=> {
      
    })
    
  })
  
});