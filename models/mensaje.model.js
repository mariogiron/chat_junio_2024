const { model, Schema } = require('mongoose');

const mensajeSchema = new Schema({
    nombre: String,
    texto: String,
    fecha: Date,
    socketId: String
}, { timestamps: true, versionKey: false });

module.exports = model('mensaje', mensajeSchema);