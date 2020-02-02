const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

const Handler_Board = require("../controllers/handler_board");
const Handler_Thread = require("../controllers/handler_thread");
const Handler_Reply = require("../controllers/handler_reply");

chai.use(chaiHttp);

suite('Functional Tests', () => {
  
  let handler_board = new Handler_Board();
  let handler_thread = new Handler_Thread();
  let handler_reply = new Handler_Reply();
  
  after( async () => {
    await handler_board.delete_all();
    await handler_thread.delete_all();
    await handler_reply.delete_all();
  });

  suite('API ROUTING FOR /api/threads/:board', () => {
    
    suite('POST', () => {
      
      
      test.skip("missing some required field", (done) => {
        
        chai.request(server)
          .post('/api/threads/:board')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
        
      })
      
      test.skip("valid fields", (done) => {
        
        chai.request(server)
          .post('/api/threads/:board')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
        
      })
      
    });
    
    suite('GET', () => {
      
      test.skip("valid board name", (done) => {
        
        chai.request(server)
          .get('/api/threads/:board')
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
        
      })
      
      test.skip("invalid board name", (done) => {
        
      })
      
      test.skip("valid board name but no threads", (done) => {
        
      })
      
    });
    
    suite('DELETE', () => {
      
      test.skip("missing thread_id", (done) => {
        
        chai.request(server)
          .delete('/api/threads/:board')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
        
      })
      
      test.skip("incorrect password", (done) => {
        
      })
      
      test.skip("delete successfully", (done) => {
        
      })
      
    });
    
    suite('PUT', () => {
      
      test.skip("valid thread_id", (done) => {
        
        chai.request(server)
          .put('/api/threads/:board')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            done();
          });
        
      })
      
      test.skip("invalid thread_id", (done) => {
        
      })
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', () => {
    
    suite('POST', () => {
      
    });
    
    suite('GET', () => {
      
    });
    
    suite('PUT', () => {
      
    });
    
    suite('DELETE', () => {
      
    });
    
  });

});
