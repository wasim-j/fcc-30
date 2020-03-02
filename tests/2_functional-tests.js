/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/
const util = require('util');
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Board = require("../models/Board");
const Thread = require("../models/Thread");
const Help = require("../controllers/helper");
const seed_db = require("../seed_db")

chai.use(chaiHttp);
const help = new Help();

suite('Functional Tests', function() {
  this.timeout(5000); // https://mochajs.org/#timeouts (to avoid Error: Timeout of 2000ms exceeded);
  
  let board_name = "general";
  
  suiteSetup( async () => {
    console.log("dropped");
    await help.drop_boards();
    await help.drop_threads();
    
  });

  suite('API ROUTING FOR /api/threads/:board', () => {
    
    let posted_thread;
    
    suite('POST', () => {
      // post a thread to a specific message board 
			// must pass form data text and delete_password
			// recomend res.redirect to board page /b/{board}
      
      test("valid post", done => {
        
        let text = "test thread"
        let delete_password = "pwd";
        
        chai.request(server)
        .post(`/api/threads/${board_name}`)
        .send({text, delete_password})
        .end(async (err, res) => {
          assert.equal(res.status, 200);
          let thread = await Thread.findOne({text}, (err, thread) => (err) ? false : thread);
          
          assert.isNotNull(thread)
         
          
          let board = await Board.findOne({threads: thread._id}, (err, board) => (err) ? false : board);
          assert.isNotNull(board)
          assert.equal(board.name, board_name)
          done()
        });
        
      })
      
      test("invalid post", done => {

        chai.request(server)
        .post(`/api/threads/${board_name}`)
        .send({text: "test thread 2"})
        .end(async (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text,"must include text and a delete password")
          let thread = await Thread.findOne({text: "test thread 2"}, (err, thread) => (err) ? false : thread);
          assert.isNull(thread);
          done();
        });
        
      })
     
      
    });
    
    suite('GET', () => {
      //  return an array of the most recent 10 bumped threads on the board with only the most recent 3 replies
			//  reported and delete_passwords fields will not be sent
      let thread;
      suiteSetup(async () => {
        let seed = await seed_db(board_name, 11 , 4);
        let first_thread = 0;
        thread = seed.threads[first_thread];
        const setTimeoutPromise = util.promisify(setTimeout);
        await setTimeoutPromise(1000, thread)
          .then( thread => {
            return Thread.findById(thread._id)
          })
          .then( thread => {
            thread.bumped_on = Date.now();
            return thread.save()
          })
      });
      
      test("array of the most recent 10 bumped threads", done => {
      
        chai.request(server)
        .get(`/api/threads/${board_name}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length, 10)
          res.body.forEach( (thread, i, arr) => {
            if(i < (arr.length - 1)){
              // only assert until index 8 as index 9 has no next thread (index 10) to compare to.
              let curr_thread = new Date(thread.bumped_on).getTime()
              let next_thread = new Date(arr[i + 1].bumped_on).getTime()
              assert.isAtLeast(curr_thread, next_thread)
            }
            assert.notProperty(thread, "delete_password");
            assert.notProperty(thread, "reported");
            
            // check replies
            assert.isAtMost(thread.replies.length, 3);
            thread.replies.forEach( (reply, i, arr) => {
              if(i < (arr.length - 1)){
                let curr_reply = new Date(reply.created_on).getTime()
                let next_reply = new Date(arr[i + 1].created_on).getTime()
                assert.isAtLeast(curr_reply, next_reply)
                
              }
              assert.notProperty(reply, "delete_password");
              assert.notProperty(reply, "reported");
              
            })
            
          })
          done();
        });

      })
      
      
    });
    
    suite('DELETE', () => {
      // delete a thread completely 
			// pass along the thread_id & delete_password. 
			// Text response will be 'incorrect password' or 'success'
      let thread;
      suiteSetup(async () => {
        let seed = await seed_db(board_name, 1 , 1)
        let last_thread = seed.threads.length - 1;
        thread = seed.threads[last_thread];
      });
      
      test("invalid input", done => {
      
        chai.request(server)
        .delete(`/api/threads/${board_name}`)
        .send({thread_id: thread._id})
        .end((err, res) => {
          assert.equal(res.text, "required fields missing");
          assert.equal(res.status, 200);
          done();
        });

      })
      
      test("invalid password", done => {
      
        chai.request(server)
        .delete(`/api/threads/${board_name}`)
        .send({thread_id: thread._id, delete_password: "hello"})
        .end((err, res) => {
          assert.equal(res.text, "incorrect password");
          assert.equal(res.status, 200);
          done();
        });

      })
      
      test("valid delete", done => {
      
        chai.request(server)
        .delete(`/api/threads/${board_name}`)
        .send({thread_id: thread._id, delete_password: thread.delete_password})
        .end(async (err, res) => {
          assert.equal(res.text, "success");
          assert.equal(res.status, 200);
          let result = await Thread.findById(thread._id).then( x => x).catch(err => false);
          assert.isNull(result);
          let board = await Board.findOne({threads: thread._id}).then( x => x).catch(err => false);
          assert.isNull(board);
          done();
        });

      })
      
      
      
      
    });
    
    suite('PUT', () => {
      // report a thread and change it's reported value to true
			// pass along the thread_id. 
			// Text response will be 'success'
      
      let thread;
      suiteSetup(async () => {
        let seed = await seed_db(board_name, 1 , 1);
        let last_thread = seed.threads.length - 1;
        thread = seed.threads[last_thread];
      });
      
      test("invalid thread_id", done => {
        let invalid_id = "hello"
        chai.request(server)
        .put(`/api/threads/${board_name}`)
        .send({thread_id: invalid_id})
        .end(async (err, res) => {
          assert.equal(res.text, "could not report a thread with this thread_id");
          assert.equal(res.status, 200);
          let result = await Thread.findById(invalid_id).then( x => x).catch(err => false);
          assert.isFalse(result);
          done();
        });

      })
      
    
    
      test("valid thread_id", done => {

          chai.request(server)
          .put(`/api/threads/${board_name}`)
          .send({thread_id: thread._id})
          .end(async (err, res) => {
            assert.equal(res.text, "success");
            assert.equal(res.status, 200);
            let result = await Thread.findById(thread._id).then( x => x).catch(err => false);
            assert.propertyVal(result, "reported", true);
            done();
          });

        })

      });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', () => {
    
    suite('POST', () => {
      // post a reply to a thread on a specific board 
			// must pass form data text, delete_password, & thread_id
			// it will also update the bumped_on date to the comments date
			// (Recomend res.redirect to thread page /b/{board}/{thread_id})
      
      let thread;
      suiteSetup(async () => {
        let seed = await seed_db(board_name, 1 , 4);
        let last_thread = seed.threads.length - 1;
        thread = seed.threads[last_thread];
      });
      
      
      test("invalid thread_id", done => {
        let invalid_id = "goodbye"
        chai.request(server)
        .post(`/api/replies/${board_name}`)
        .send({thread_id: invalid_id, text: "hi", delete_password: "qwerty"})
        .end(async (err, res) => {
          
          assert.equal(res.text, "thread_id is invalid");
          assert.equal(res.status, 200);
          done();
        });

      })
      
      test("missing required fields", done => {
        
        chai.request(server)
        .post(`/api/replies/${board_name}`)
        .send({thread_id: thread._id})
        .end(async (err, res) => {
          //console.log(res.text);
          assert.equal(res.text, "must include text and a delete password");
          assert.equal(res.status, 200);
          done();
        });

      })
      
      test("valid reply", done => {
        let text = "hi"
        let delete_password = "qwerty"
        chai.request(server)
        .post(`/api/replies/${board_name}`)
        .send({thread_id: thread._id, text, delete_password})
        .end(async (err, res) => {
          assert.equal(res.status, 200);
          let result = await Thread.findById(thread._id).then( x => x).catch(err => false);
          let my_reply = result.replies[result.replies.length - 1];
          assert.equal(my_reply.text, text )
          assert.equal(my_reply.delete_password, delete_password )
          
          done();
        });

      })
      
      
    });
    
    suite('GET',	 () => {
      // an entire thread with all it's replies
			// reported and delete_passwords fields will not be sent
      let thread;
      suiteSetup(async () => {
        let seed = await seed_db(board_name, 1 , 4);
        let last_thread = seed.threads.length - 1;
        thread = seed.threads[last_thread];
      });
      
      test("get replies", done => {
        let thread_id = thread._id.toString();
        chai.request(server)
        .get(`/api/replies/${board_name}`)
        .query({thread_id})
        .end(async (err, res) => {
          assert.equal(res.status, 200);
          assert.lengthOf(res.body.replies, 4)
          assert.notProperty(res.body, "delete_password");
          assert.notProperty(res.body, "reported");
          res.body.replies.forEach(reply => {
            assert.notProperty(reply, "delete_password");
            assert.notProperty(reply, "reported");
          })
          done();
        });

      })
      
      
      
      
    });
    
    suite('PUT', () => {
			// report a reply and change it's reported value to true
			// pass along the thread_id & reply_id. 
			// Text response will be 'success'
      
      let thread;
      suiteSetup(async () => {
        let seed = await seed_db(board_name, 1 , 1);
        let last_thread = seed.threads.length - 1;
        thread = seed.threads[last_thread];
      });
      
      test("invalid thread_id", done => {
        let invalid_id = "hello"
        chai.request(server)
        .put(`/api/replies/${board_name}`)
        .send({thread_id: invalid_id})
        .end(async (err, res) => {
          assert.equal(res.text, "thread_id is invalid");
          assert.equal(res.status, 200);
          let result = await Thread.findById(invalid_id).then( x => x).catch(err => false);
          assert.isFalse(result);
          done();
        });

      })
      
      test("invalid reply_id", done => {
        
        chai.request(server)
        .put(`/api/replies/${board_name}`)
        .send({thread_id: thread._id, reply_id: thread._id})
        .end(async (err, res) => {
          assert.equal(res.text, "reply_id does not exist in specified thread");
          assert.equal(res.status, 200);
          let result = await Thread.findById(thread._id).then( x => x).catch(err => false);
          let reply = thread.replies.findIndex( reply => reply._id.toString() === thread._id.toString());
          assert.equal(reply, -1)
          done();
        });

      })
      
      test("valid reply_id", done => {
        let reply_id = thread.replies[0]._id;
        chai.request(server)
        .put(`/api/replies/${board_name}`)
        .send({thread_id: thread._id, reply_id})
        .end(async (err, res) => {
          assert.equal(res.text, "success");
          assert.equal(res.status, 200);
          let result = await Thread.findById(thread._id).then( x => x).catch(err => false);
          let reply_index = thread.replies.findIndex( reply => reply._id.toString() === reply_id.toString());
          assert.equal(reply_index, 0);
          assert.isTrue(result.replies[reply_index].reported);
          done();
        });

      })
      
    });
    
    suite('DELETE', () => {
      // delete a post(just changing the text to '[deleted]')
			// pass along the thread_id, reply_id, & delete_password. 
			// Text response will be 'incorrect password' or 'success'
      
      let thread;
      suiteSetup(async () => {
        let seed = await seed_db(board_name, 1 , 1);
        let last_thread = seed.threads.length - 1;
        thread = seed.threads[last_thread];
      });
      
      test("invalid thread_id", done => {
        let invalid_id = "hello"
        chai.request(server)
        .delete(`/api/replies/${board_name}`)
        .send({thread_id: invalid_id})
        .end(async (err, res) => {
          assert.equal(res.text, "thread_id is invalid");
          assert.equal(res.status, 200);
          let result = await Thread.findById(invalid_id).then( x => x).catch(err => false);
          assert.isFalse(result);
          done();
        });

      })
      
      test("invalid reply_id", done => {
        
        chai.request(server)
        .delete(`/api/replies/${board_name}`)
        .send({thread_id: thread._id, reply_id: thread._id})
        .end(async (err, res) => {
          assert.equal(res.text, "reply_id does not exist in specified thread");
          assert.equal(res.status, 200);
          let result = await Thread.findById(thread._id).then( x => x).catch(err => false);
          let reply_index = thread.replies.findIndex( reply => reply._id.toString() === thread._id.toString());
          assert.equal(reply_index, -1)
          done();
        });

      })
      
      test("invalid password", done => {
        let reply_id = thread.replies[0]._id;
        let delete_password = "wrong";
        chai.request(server)
        .delete(`/api/replies/${board_name}`)
        .send({thread_id: thread._id, reply_id, delete_password})
        .end(async (err, res) => {
          assert.equal(res.text, "incorrect password");
          assert.equal(res.status, 200);
          let result = await Thread.findById(thread._id).then( x => x).catch(err => false);
          let reply_index = thread.replies.findIndex( reply => reply._id.toString() === reply_id.toString());
          assert.equal(reply_index, 0)
          assert.notStrictEqual(delete_password, result.replies[reply_index].delete_password)
          done();
        });

      })
      
      test("valid password", done => {
        let reply_id = thread.replies[0]._id;
        let delete_password = thread.replies[0].delete_password;
        chai.request(server)
        .delete(`/api/replies/${board_name}`)
        .send({thread_id: thread._id, reply_id, delete_password})
        .end(async (err, res) => {
          assert.equal(res.text, "success");
          assert.equal(res.status, 200);
          let result = await Thread.findById(thread._id).then( x => x).catch(err => false);
          let reply_index = thread.replies.findIndex( reply => reply._id.toString() === reply_id.toString());
          assert.equal(reply_index, 0)
          assert.strictEqual(result.replies[reply_index].delete_password, delete_password);
          assert.strictEqual(result.replies[reply_index].text, "[deleted]");
          done();
        });

      })
      
      
    });
    
  });

});
