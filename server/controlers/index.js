'use strict'

const chatService = require('../chat.service');


exports.list = async (req, res, next) => {
  try {
    const salas = await chatService.getRooms()
    res.status(200).send(salas);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: 'Falha ao processar sua requisição'
    });
  }
};

exports.enterRoom = async (req, res, next) => {
  try {
    let sala = req.params.roomId;
    let user = req.params.userId;
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

exports.getRoomMessages = async (req, res, next) => {
  try {
    let room = req.params.roomId;
    const salas = await chatService.getRoomMessages(room);
    res.status(200).send(salas);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: 'Falha ao processar sua requisição'
    });
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const menssagem = await chatService.createMessage(req.body);
    res.status(200).send(menssagem);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: 'Falha ao processar sua requisição'
    });
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const sala = await chatService.createRoom(req.body);
    res.status(200).send(sala);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: 'Falha ao processar sua requisição'
    });
  }
};
