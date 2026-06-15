const localtunnel = require('localtunnel');
const port = 5000;

(async () => {
  try {
    const tunnel = await localtunnel({ port });
    console.log(`TUNNEL_URL=${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });
  } catch (error) {
    console.error('Failed to start tunnel:', error);
  }
})();
