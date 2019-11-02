import { Client } from '@ducktapejs/server';
import express from 'express';

const setupIntegration = (client: Client) => {
  const app = express();
  client.setupCore({
    name: 'test',
    server: app,
    session: {} as any,
    url: 'http://localhost',
  });
  return {
    app,
  };
};

export default setupIntegration;
