const ip = require('ip');
const fs = require('fs');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var os = require('os');
var pty = require('node-pty');
var addr = ip.address();
var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
 ///////////////////////////////////////////////////////////////////
server.listen(2001);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
});

    io.on('connection', function(socket){
        var ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: process.env.HOME,
            env: process.env
        });
      
    io.emit('term', `A shell has been opened at ${addr}`);

    ptyProcess.on('data', function(data) {
        //return terminal output
        console.log(data);
      socket.emit('term', data)
      fs.writeFile("test.bin", data, 'binary',function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });
    });

    socket.on('term', function(msg){
      io.emit('term', msg);
  
      ptyProcess.write(`${msg}\r`);
      ptyProcess.resize(80, 30);
      //ptyProcess.write('cd\r');
      
        

      });

    });

  