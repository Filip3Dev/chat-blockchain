'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();
const router = express.Router();
const morgan = require('morgan')

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

const index = require('../routes/index');

app.use(cors(corsOptions))

app.use(bodyParser.json({
  limit: '50mb', extended: true
}));
app.use(bodyParser.urlencoded({
  limit: '50mb', extended: true
}));
app.use(morgan('combined'))

app.use('/', index);

module.exports = app;
