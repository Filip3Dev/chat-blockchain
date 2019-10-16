'use strict'

const express = require('express');
const router = express.Router();
const controller = require('../controlers/index');

router.get('/', async (req, res, next) => {
  res.status(200).send({
    title: "Rodando liso a 1080P",
    version: '1.0.0',
  });
});

router.get('/salas', controller.list);
router.get('/sala/:roomId/entrar/:userId', controller.enterRoom);
router.get('/sala/usuario/:userId', controller.getUserRooms);

module.exports = router;
