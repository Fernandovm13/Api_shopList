const WebSocket = require('ws');
const crypto = require('crypto'); // Usando el módulo nativo para evitar errores de versión
const itemRepo = require('../repos/itemRepo');
const listRepo = require('../repos/listRepo'); // Añadido para verificar permisos
const { verifyToken } = require('../services/authService');

function startWSS(server) {
  const wss = new WebSocket.Server({ server });
  const subscriptions = new Map(); // listId -> Set(ws)

  wss.on('connection', async (ws, req) => {
    // Extraer y verificar el token de la URL
    const token = new URL(req.url, 'http://h').searchParams.get('token');
    const user = verifyToken(token);
    
    if (!user) {
      return ws.close(4001, 'No autorizado');
    }

    ws.userId = user.sub;

    ws.on('message', async (data) => {
      try {
        const { type, payload } = JSON.parse(data);

        // 1. Suscribirse a una lista (Validando que sea colaborador)
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

        // 2. Crear ítem (Sincronizado con base de datos y broadcast)
        if (type === 'create_item') {
          const item = await itemRepo.insertItem({ 
            id: crypto.randomUUID(), // Uso de crypto nativo
            listId: payload.listId, 
            ...payload, 
            created_by: ws.userId 
          });
          
          broadcast(payload.listId, { type: 'item_created', item });
        }

        // 3. Actualizar ítem (Manejo de estados: Pendiente/Completado)
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

  // Función para notificar a todos los dispositivos conectados a una misma lista
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