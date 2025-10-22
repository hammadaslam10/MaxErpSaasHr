const { spawn } = require('child_process');
const express = require('express');
const path = require('path');

// Start the main server on port 4001
console.log('🚀 Starting MaxERP Server on port 4001...');
const server = spawn('npm', ['run', 'start:dev'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Create a simple proxy server for docs on port 4002
const app = express();
const PORT = 4002;

app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

app.get('/api/docs', (req, res) => {
  res.redirect('http://localhost:4001/api/docs');
});

app.get('/api/docs/*', (req, res) => {
  res.redirect(`http://localhost:4001${req.originalUrl}`);
});

app.listen(PORT, () => {
  console.log(`📚 Documentation server running on http://localhost:${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🔗 Direct API access: http://localhost:4001`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  server.kill();
  process.exit(0);
});
