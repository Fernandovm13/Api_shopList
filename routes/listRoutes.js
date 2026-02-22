const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');

router.get('/lists', listController.getUserLists);
router.post('/lists', listController.createList);
router.put('/lists/:id', listController.updateList);   
router.delete('/lists/:id', listController.deleteList); 
router.post('/lists/:id/invite', listController.invite);

router.get('/lists/:id/items', listController.getItems);
router.post('/lists/:id/items', listController.addItem);
router.put('/items/:id', listController.updateItem);    

router.get('/invitations/:userId', listController.getPendingInvitations);
router.post('/invitations/respond', listController.respondToInvitation);

module.exports = router;