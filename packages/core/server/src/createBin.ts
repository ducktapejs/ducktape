import commander from 'commander';
import path from 'path';
import express, { Express } from 'express';
import Config from "./Config";
import Client from "./Client";
import setup from './setup';

export type RunApi = {
  app: Express;
};

const handle = (fn: (...args: any[]) => Promise<void>) => (...args: any[]) => {
  fn(...args)
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

const createBin = async <T extends {[name: string]: Client}>(config: Config<T>, run: (clients: T, api: RunApi) => Promise<void>) => {
  const { getClients, getServer } = setup(config);
  await config.configStore.load();

  const start = async () => {
    const server = await getServer();
    const app = express();
    server.app.use('/custom', app);
    await server.start();
    const clients = await getClients();
    await run(clients, {
      app,
    });
  }

  const createConfig = async () => {
    const server = await getServer();
    await server.createConfig();
  }

  const runScript = async (location: string) => {
    const target = path.resolve(location);
    const server = await getServer();
    await server.setupClients();
    const clients = await getClients();
    const script = require(target);
    script.default(clients, {});
  }

  const startCmd = commander.command('start');
  startCmd.action(handle(start));

  const createConfigCmd = commander.command('create-config');
  createConfigCmd.action(handle(createConfig));

  const runScriptCmd = commander.command('run <script>');
  runScriptCmd.action(handle(runScript));

  commander.parse(process.argv);
}

export default createBin;