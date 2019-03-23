class SocketService {
  constructor(server) {
    const io = require('socket.io')(server);

    io.on('connection', (client) => {
      this.client = client;

      client.on('disconnect', () => {
        this.client = undefined;
      });
    });
  }

  emit(text) {
    if (this.client) {
      this.client.emit('process', text);
    }
  }
}

module.exports = {
  SocketService,
};
