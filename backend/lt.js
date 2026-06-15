const localtunnel = require('localtunnel');
const SUBDOMAIN = 'pragnanthreddybaireddy-api';

async function startTunnel() {
  try {
    const tunnel = await localtunnel({ port: 5000, subdomain: SUBDOMAIN });
    
    if (!tunnel.url.includes(SUBDOMAIN)) {
      console.log(`Got wrong URL: ${tunnel.url}. Retrying...`);
      tunnel.close();
      return;
    }

    console.log('Tunnel URL:', tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed. Restarting in 1s...');
      setTimeout(startTunnel, 1000);
    });
  } catch (err) {
    console.error('Tunnel error:', err);
    setTimeout(startTunnel, 1000);
  }
}

console.log('Starting persistent localtunnel...');
startTunnel();

// Keep process alive
setInterval(() => {}, 1000 * 60 * 60);
