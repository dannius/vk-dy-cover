const app = require('express')();
const { interval: RxInterval$ } = require('rxjs');

//settings
const { port } = require('./lib');
require('dotenv').config();


app.listen(port, serve);

function serve() {
  console.log(`server listen port ${port}`);
  console.log(`${process.env.LOGIN}`);

  // RxInterval$(1000)
  //   .subscribe(()=>{
  //     console.log(1);
  //   });
}
