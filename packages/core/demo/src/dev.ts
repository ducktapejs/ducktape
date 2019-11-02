require('dotenv').config();
import nodemon from 'nodemon';
import ngrok from 'ngrok';

var args = process.argv.slice(2);

const start = async () => {
  const url = await ngrok.connect({
    authtoken: process.env.NGROK_AUTH_TOKEN,
    subdomain: process.env.NGROK_SUBDOMAIN,
    region: process.env.NGROK_REGION as any || 'eu',
    addr: 5006,
  });

  nodemon({
    exec: `yarn start ${args.join(' ')}`,
    ext: 'ts',
    env: { PORT: 5006, URL: url },
  }).on('quit', () => {
    console.log('App has quit');
    process.exit();
  }).on('restart', (files) => {
    console.log('App restarted due to: ', files);
  });
};

start().catch(console.error);