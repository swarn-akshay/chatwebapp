const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const peers = new Map();

// Allow cross-origin requests (required for Ngrok)
wss.on('headers', (headers) => {
  headers.push('Access-Control-Allow-Origin: *');
});

wss.on('listening', () => {
  console.log('🚀 Signaling server running on port 8080');
});

wss.on('connection', (ws) => {
  const id = generateId(); // Generate unique ID for peer
  peers.set(id, ws);
  ws.send(JSON.stringify({ type: 'id', id })); // Send ID to client

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.targetId && peers.has(data.targetId)) {
        const targetPeer = peers.get(data.targetId);
        targetPeer.send(JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    peers.delete(id);
    console.log(`Peer ${id} disconnected`);
  });
});

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}