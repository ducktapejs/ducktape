import { createBin, ConfigStore, RunApi } from '@ducktapejs/server';
import Github from '@ducktapejs/integration-github';
import Slack from '@ducktapejs/integration-slack';
import code from './code';

const clients = {
  github: new Github(),
  slack: new Slack(),
};

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const url = process.env.URL || `http://localhost:${port}`;
const configStore = new ConfigStore(process.env.CONFIG_LOCATION);

const start = async () => {
  await createBin({
    port,
    url,
    configStore,
    clients,
  }, code);
};

start().catch(console.error);

export type ClientsType = typeof clients;
declare global {
  type Script = (clients: ClientsType, api: RunApi) => Promise<void>
}