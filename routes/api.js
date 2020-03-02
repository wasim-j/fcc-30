'use strict';

const expect = require('chai').expect;
const Thread_Handler = require('../controllers/thread_handler.js');
const Reply_Handler = require('../controllers/reply_handler.js');

const thread_handler = new Thread_Handler();
const reply_handler = new Reply_Handler();

module.exports = app => {
  
  app.route('/api/threads/:board')
		.get((req,res) => thread_handler.get(req,res))
    .post((req,res) => thread_handler.post(req,res))
    .put((req,res) => thread_handler.put(req,res))
    .delete((req,res) => thread_handler.del(req,res))  
    
  app.route('/api/replies/:board')
		.get((req,res) => reply_handler.get(req,res))
    .post((req,res) => reply_handler.post(req,res))
    .put((req,res) => reply_handler.put(req,res))
    .delete((req,res) => reply_handler.del(req,res))  
};
