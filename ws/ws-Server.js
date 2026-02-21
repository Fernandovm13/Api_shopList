const WebSocket = require('ws');
const crypto = require('crypto'); 
const itemRepo = require('../repos/itemRepo');
const listRepo = require('../repos/listRepo'); 
const { verifyToken } = require('../services/authService');

function startWSS(server) {
  const wss = new WebSocket.Server({ server });
  const subscriptions = new Map(); 

  wss.on('connection', async (ws, req) => {
    const token = new URL(req.url, 'http://h').searchParams.get('token');
    const user = verifyToken(token);
    
    if (!user) {
      return ws.close(4001, 'No autorizado');
    }

    ws.userId = user.sub;

    ws.on('message', async (data) => {
      try {
        const { type, payload } = JSON.parse(data);

        if (type === 'subscribe') {
          const canAccess = await listRepo.isCollaborator(payload.listId, ws.userId);
          if (!canAccess) {
            return console.log(`Acceso denegado para usuario ${ws.userId} a la lista ${payload.listId}`);
          }

          if (!subscriptions.has(payload.listId)) {
            subscriptions.set(payload.listId, new Set());
          }
          
          subscriptions.get(payload.listId).add(ws);
          ws.currentListId = payload.listId;
          console.log(`Usuario ${ws.userId} suscrito a lista: ${payload.listId}`);
        }

        if (type === 'create_item') {
          const item = await itemRepo.insertItem({ 
            id: crypto.randomUUID(), 
            listId: payload.listId, 
            ...payload, 
            created_by: ws.userId 
          });
          
          broadcast(payload.listId, { type: 'item_created', item });
        }

        if (type === 'update_item') {
          const ok = await itemRepo.updateItem(payload.id, payload.changes, payload.version);
          if (ok) {
            const updated = await itemRepo.getItem(payload.id);
            broadcast(updated.list_id, { type: 'item_updated', item: updated });
          }
        }
      } catch (error) {
        console.error("Error procesando mensaje WS:", error.message);
      }
    });

    ws.on('close', () => {
      if (ws.currentListId && subscriptions.has(ws.currentListId)) {
        subscriptions.get(ws.currentListId).delete(ws);
      }
    });
  });

  function broadcast(listId, msg) {
    const clients = subscriptions.get(listId);
    if (clients) {
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(msg));
        }
      });
    }
  }
}

module.exports = { startWSS };