const http = require('http');
const app = require('./app');
const server = http.createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 8001;
connections = [];
users = [];
chat = [];
news = [];

io.on('connection', (socket) => {
  connections.push(socket)
  const id = socket.id
  console.log(id)
  socket.on('disconnect', (socket) => {
    let user = ''
    for (x in users) {
      if(users[x].socketId === id) {
        user = users[x].username
        users.splice(x, 1);
      }
  }
    connections.splice(connections.indexOf(socket), 1);
    console.log(user+' disconnected: %s sockets connected', connections.length);
    
    io.emit('user left.', user);
    updateUserList()
  })
  
  socket.on('send message', (payload) => {
    const data = {
      message: payload,
      user: socket.userInfo.username
    }
    io.emit('new message', data);
    io.emit('not typing', payload);
    
  });

  socket.on('message typing', (payload) => {
    io.emit('typing', payload);
  });

  socket.on('message not typing', (payload) => {
    io.emit('not typing', payload);
  });

  socket.on('new user', (payload) => {
    const userInfo = {
      socketId: socket.id,
      username: payload
    }
    socket.userInfo = userInfo;
    users.push(userInfo)
    io.emit('new user join notify', userInfo.username)
    console.log(userInfo.username  +' connected: %s sockets connected', connections.length);
    updateUserList()
  });

  const updateUserList = () => {
    io.emit('get users', users);
  }
});


server.listen(port, () => {
  console.log("listing " + port)
});

