const os = require("os");
const https = require("https");

/** Restituisce il primo indirizzo IPv4 non-interno della macchina (rete locale) */
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address;
    }
  }
  return "127.0.0.1";
}

/** Interroga un servizio esterno per ottenere l'IP pubblico. Non blocca l'avvio in caso di errore. */
const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

function getPublicIP() {
  return new Promise((resolve) => {
    const req = https.get("https://api.ipify.org", { timeout: 3000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        const value = data.trim();
        resolve(res.statusCode === 200 && IPV4_REGEX.test(value) ? value : "non disponibile");
      });
    });
    req.on("error", () => resolve("non disponibile"));
    req.on("timeout", () => {
      req.destroy();
      resolve("non disponibile");
    });
  });
}

module.exports = { getLocalIP, getPublicIP };
