const jwt = require('jsonwebtoken');

module.exports = function setupSockets(io) {
  // Authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;
    const room = `${role}:${id}`;
    socket.join(room);
    console.log(`🔌 Socket connected: ${room} (${socket.id})`);

    // Driver typing indicator → relay to patient
    socket.on('driver:typing', (data) => {
      // data = { emergencyId, patientId }
      if (data.patientId) {
        io.to(`patient:${data.patientId}`).emit('driver:typing', {
          emergencyId: data.emergencyId,
          typing: true
        });
      }
    });

    // Hospital bed update broadcast
    socket.on('hospital:bedUpdate', (data) => {
      // data = { hospitalId, availableBeds, icuAvailable }
      io.emit('hospital:bedUpdate', data);
    });

    // Smooth location interpolation relay
    socket.on('location:smooth', (data) => {
      // data = { emergencyId, patientId, hospitalId, lat, lng }
      if (data.patientId) {
        io.to(`patient:${data.patientId}`).emit('location:smooth', data);
      }
      if (data.hospitalId) {
        io.to(`hospital:${data.hospitalId}`).emit('location:smooth', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${room} (${socket.id})`);
    });
  });
};
