const http = require('node:http');

const Mensaje = require('./models/mensaje.model');

// Config .env
require('dotenv').config();

// Config BD
require('./config/db');

// Crear server HTTP
const server = http.createServer((req, res) => res.end('Server HTTP'));

const PORT = process.env.PORT || 3000;
server.listen(PORT);
server.on('listening', () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});

// Config WS server
const io = require('socket.io')(server, {
    cors: { origin: '*' }
});

io.on('connection', async (socket) => {
    console.log('Se ha conectado un nuevo cliente');
    socket.broadcast.emit('chat_message_server', {
        nombre: 'INFO',
        texto: 'Se ha conectado un nuevo usuario',
        fecha: new Date()
    });

    // Miro el token recibido
    if (socket.handshake.query && socket.handshake.query.token) {
        console.log(socket.handshake.query.token);

    }

    io.emit('clients_online', io.engine.clientsCount);

    // Recuperar los 5 últimos mensajes y enviarlos al socket que se conecta
    const mensajes = await Mensaje.find().sort({ createdAt: -1 }).limit(5);
    socket.emit('chat_init', mensajes)

    socket.on('chat_message_client', async (data) => {
        data.socketId = socket.id;
        const nuevoMensaje = await Mensaje.create(data);
        io.emit('chat_message_server', data);
    });

    socket.on('disconnect', () => {
        io.emit('chat_message_server', {
            nombre: 'INFO',
            texto: 'Se ha desconectado un usuario',
            fecha: new Date()
        });
        io.emit('clients_online', io.engine.clientsCount);
    })
})