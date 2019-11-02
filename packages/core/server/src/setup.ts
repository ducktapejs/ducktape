import Client from './Client';
import Config from './Config';
import create from './createServer';

const setup = <T extends {[name: string]: Client}>(config: Config<T>) => {
  const serverPromise = (async () => {
    const server = await create(config);
    return server;
  })();

  const getServer = async () => {
    const server = await serverPromise;
    return server;
  }

  const getClients = async () => {
    const server = await getServer();
    return server.clients;
  }

  return {
    getServer,
    getClients,
  };
};

export default setup;