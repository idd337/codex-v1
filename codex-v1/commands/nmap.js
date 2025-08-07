// nmap.js
const { NmapScan } = require('node-nmap');
NmapScan.nmapLocation = "nmap"; // Path to nmap binary, ensure nmap is installed

module.exports = {
  name: 'nmap',
  description: 'Scan an IP or domain for open ports',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const target = args[0];

    if (!target) {
      return sock.sendMessage(from, { text: 'Please provide an IP address or domain. Usage: !nmap 192.168.1.1' }, { quoted: msg });
    }

    const scan = new NmapScan(target);

    scan.on('complete', async (data) => {
      let reply = `Nmap scan results for target:`;
      data.forEach(host => 
        if (host.openPorts.length) 
          host.openPorts.forEach(port => 
            reply += `Port{port.port}: ${port.service}\n`;
          });
        } else {
          reply += 'No open ports found.\n';
        }
      });
      await sock.sendMessage(from, { text: reply.trim() });
    });

    scan.on('error', async (error) => {
      await sock.sendMessage(from, { text: 'Error running nmap scan. Make sure nmap is installed.' }, { quoted: msg });
    });

    scan.startScan();
  }
}; 