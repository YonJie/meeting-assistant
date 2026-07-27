'use strict';

const express = require('express');
const ctrl = require('../controllers/meetingController');

const router = express.Router();

router.post('/', ctrl.create);
router.get('/', ctrl.findAll);
router.get('/:id', ctrl.findOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);
router.post('/:id/summarize', ctrl.summarize);
router.put('/:id/todos/:index', ctrl.updateTodo);

module.exports = router;
