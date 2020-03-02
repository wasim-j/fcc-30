const mongoose = require('mongoose');

module.exports = () => {
  mongoose.set('useNewUrlParser', true);   // to avoid deprecation warnings 
  mongoose.set('useFindAndModify', false); // https://mongoosejs.com/docs/deprecations.html#-findandmodify-
  mongoose.set('useUnifiedTopology', true);//
  
  mongoose.Promise = global.Promise;
  mongoose.connect(process.env.MONGOLAB_URI)
  
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.on('close', () => {
    console.info('closed db connection')
  })
  
  return new Promise((resolve, reject) => {
    db.once('open', () => {
      console.info('connected to db');
      resolve(db);
    });
  });
}