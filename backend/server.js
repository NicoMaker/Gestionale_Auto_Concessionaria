const http = require("http");

const { creaApp } = require("./app");
const { createTables } = require("./config/db");
const seed = require("./data/seed");
const realtime = require("./realtime");
const { getLocalIP, getPublicIP } = require("./utils/network");

const PORT = process.env.PORT || 3000;

async function initDatabase() {
  createTables();
  // piccola attesa per lasciare che le CREATE TABLE (in coda su db.serialize) si completino
  await new Promise((resolve) => setTimeout(resolve, 300));
  await seed();
}

async function avvia() {
  await initDatabase();

  const app = creaApp({ port: PORT });
  const server = http.createServer(app);
  realtime.init(server);

  server.listen(PORT, "0.0.0.0", async () => {
    const localIP = getLocalIP();
    const publicIP = await getPublicIP();
    console.log(`\n✅ Server Gestionale Auto avviato con Socket.IO`);
    console.log(`🌐 IP Pubblico: http://${publicIP}:${PORT}`);
    console.log(`🏠 IP Locale:   http://${localIP}:${PORT}`);
    console.log(`📍 Localhost:   http://localhost:${PORT}\n`);
  });
}

avvia().catch((err) => {
  console.error("❌ Errore fatale in fase di avvio:", err);
  process.exit(1);
});
