const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.get('/lists', listController.getUserLists);
router.post('/lists', listController.createList);
router.post('/lists/:id/invite', listController.invite);

router.get('/lists/:id/items', listController.getItems);
router.post('/lists/:id/items', listController.addItem);

module.exports = router;