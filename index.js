const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

function start() {
   let args = [path.join(__dirname, 'plugins.js'), ...process.argv.slice(2)];
   console.log([process.argv[0], ...args].join('\n'));
   let p = spawn(process.argv[0], args, {
         stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      })
      .on('message', data => {
         if (data == 'reset') {
            console.log('Restarting Bot...');
            p.kill();
            start();
            delete p;
         }
      })
      .on('exit', code => {
         console.error('Exited with code:', code);
         if (code == '.' || code == 1 || code == 0) start();
      });
}

// Start the bot
start();

// Setup Express server for uptime monitoring
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is active!');
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Ping the server every 5 minutes to keep it alive
setInterval(() => {
    require('http').get(`http://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/`);
}, 300000); // 300000 ms = 5 minutes
