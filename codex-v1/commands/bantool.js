const WABanManager = require('./ban.js');

const banManager = new WABanManager({
  apiKey: 'YOUR_API_KEY'
});

// Single ban
banManager.banNumber('+1234567890', 'Violating terms of service')
  .then(result => console.log('Ban result:', result))
  .catch(error => console.error('Error:', error.message));

// Batch ban
const numbers = [
  '+1234567890',
  '+1234567891',
  '+1234567892'
];

banManager.batchBan(numbers, 'Mass spamming')
  .then(results => {
    console.log(`Successfully banned ${results.filter(r => r.success).length} numbers`);
  })
  .catch(error => console.error('Bulk ban error:', error.message));