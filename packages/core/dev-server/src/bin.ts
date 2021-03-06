#!/usr/bin/env node
require('dotenv').config();
import nodemon from 'nodemon';
import ngrok from 'ngrok';

var args = process.argv.slice(2);

const start = async () => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5006;
  const url = await ngrok.connect({
    authtoken: process.env.NGROK_AUTH_TOKEN,
    subdomain: process.env.NGROK_SUBDOMAIN,
    region: process.env.NGROK_REGION as any || 'eu',
    addr: port,
  });

  console.log(`Dev server has started on ${url} and is using port ${port}`);

  nodemon({
    exec: `npm start ${args.join(' ')}`,
    ext: 'ts',
    env: { PORT: port, URL: url },
  }).on('quit', () => {
    console.log('App has quit');
    process.exit();
  }).on('restart', (files) => {
    console.log('App restarted due to: ', files);
  });
};

start().catch(console.error);