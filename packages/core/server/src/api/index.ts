import express from 'express';
import Client from '../Client';
import createSession from '../security/session';

const create = (clients: {[name: string]: Client}) => {
  const app = express();

  app.get('/user', (req, res) => {
    res.json(req.user);
  });

  app.get('/status', async (req, res) => {
    const clientInfo = await Promise.all(Object.keys(clients).map(async (name) => {
      const client = clients[name];
      let status: boolean | Error;
      try {
        status = await client.healthCheck();
      } catch (err) {
        status = err;
      }
      return {
        name,
        health: status === true,
        error: status instanceof Error ? status : undefined,
        endpoints: client.endpoints,
      }
    }));

    const response = {
      services: clientInfo,
    };

    res.json(response);
  });

  return app;
}

export default create;