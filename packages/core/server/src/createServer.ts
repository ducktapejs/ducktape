import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import Client from './Client';
import Config from './Config';
import api from './api';
import inquirer from 'inquirer';
import ConfigStore from './ConfigStore';
import createSession from './security/session';

const json = bodyParser.json();

const createClientConfig = async (name: string, client: Client, configStore: ConfigStore) => {
  const clientConfig = configStore.get(name);
  if (clientConfig) {
    const answers = await inquirer.prompt({
      name: 'overwrite',
      type: 'confirm',
      message: `${name} is already configures, do you want to reconfigure it?`,
    });
    if (!answers.overwrite) return;
  }
  console.log(`\n\n--- configuring ${name} ---\n`);
  const newConfig = await client.createConfig(clientConfig);
  configStore.set(name, newConfig);
  await configStore.save();
};

const create = async <T extends {[name: string]: Client}>(config: Config<T>) => {
  const app = express();
  const services = express();
  const clients = config.clients;
  const session = createSession(
    `${config.url}/login-callback`,
    clients,
    config.sessionSecret || 'foo'
  );
  const clientNames = Object.keys(clients);
  await Promise.all(clientNames.map(async (name) => {
    const service = express();
    service.use(json);
    services.use(`/${name}`, service);
    const client = clients[name];
    client.setupCore({
      name,
      server: service,
      session,
      url: `${config.url}/services/${name}`,
    });
  }));
  app.use(cookieParser());
  app.use(session.middleware);
  app.use('/services', services);
  app.use('/api', api(clients));

  const setupClients = async () => {
    await Promise.all(clientNames.map(name => {
      const client = clients[name];
      const clientConfig = config.configStore.get(name);
      client.setup(clientConfig);
    }));
  }

  const start = () => new Promise(async (resolve) => {
    await setupClients();
    app.listen(config.port, () => {
      resolve();
    });
  });

  const createConfig = async () => {
    const server = app.listen(config.port);
    for (let name of clientNames) {
      const client = clients[name];
      await createClientConfig(name, client, config.configStore);
    }
    server.close();
    process.exit();
  }

  return {
    app,
    start,
    createConfig,
    setupClients,
    clients,
  }
};

export default create;