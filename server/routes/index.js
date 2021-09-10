'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../controlers/index');
const chatService = require('../chat.service');

router.get('/', async (req, res, next) => {
  try {
    const salas = await chatService.getRooms();
    res.status(200).send({ title: "Rodando liso a 1080P", version: '1.0.0', rooms: salas.length });
  } catch (error) {
    console.error('error: ', error);
    res.status(500).send({ title: "Falha na verificação", version: '1.0.0', data: JSON.stringify(error) });
  }
});

router.get('/room', controller.list);
router.get('/room/:roomId/enter/:userId', controller.enterRoom);
router.get('/room/user/:userId', controller.getUserRooms);
router.get('/room/:roomId', controller.getRoomMessages);
router.post('/message', controller.createMessage);
router.post('/room', controller.createRoom);

module.exports = router;
