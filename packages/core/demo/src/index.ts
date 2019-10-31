import ngrok from 'ngrok';
import { createBin, ConfigStore } from '@ducktapejs/server';
import Github from '@ducktapejs/integration-github';
import code from './code'

const ngrokConfig = require('../secrets/config.js');
const config = new ConfigStore();

const clients = {
  github: new Github(),
};

const start = async () => {
  const url = await ngrok.connect({
    authtoken: ngrokConfig.ngrok.authToken,
    subdomain: ngrokConfig.ngrok.subdomain,
    region: ngrokConfig.ngrok.region,
    addr: 5007,
  });

  await createBin({
    port: 5007,
    url,
    configStore: config,
    clients,
  }, code);
};

start().catch(console.error);

export type Clients = typeof clients;