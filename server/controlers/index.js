'use strict'

const chatService = require('../chat.service');


exports.list = async (req, res, next) => {
  try {
    const salas = await chatService.getRooms()
    res.status(200).send(salas);
  } catch (e) {
    res.status(500).send({
      message: 'Falha ao processar sua requisição'
    });
  }
};

exports.enterRoom = async (req, res, next) => {
  try {
    let sala = req.params.roomId;
    let user = req.params.userId;
    console.log("Sala: ", sala)
    console.log("User: ", user)

    const salas = await chatService.joinRoom(user, sala);
    res.status(200).send(salas);
  } catch (e) {
    console.log(e)
    res.status(500).send({
      message: 'Falha ao processar sua requisição'
    });
  }
};

exports.getUserRooms = async (req, res, next) => {
  try {
    let user = req.params.userId;
    const salas = await chatService.getUserRooms(user);
    res.status(200).send(salas);
  } catch (e) {
    console.log(e)
    res.status(500).send({
      message: 'Falha ao processar sua requisição'
    });
  }
};
