import express from 'express';
import Octokit from '@octokit/rest';
import { ClientApi } from '@ducktapejs/server';
import { createResolvable } from '../utils/promsie';
import createManifest from './manifest';
import redirect from './redirect';
import { Config } from '../Client';

const register = (api: ClientApi) => async (): Promise<Config> => {
  const setupClient = new Octokit();
  const app = express();
  const hookUrl = api.registerHook({ name: 'hooks' }, async () => {});
  const setupUrl = api.registerMiddleware({ name: 'setup' }, app); 
  const codePromise = createResolvable<string>();
  app.get('/code', (req, res) => {
    codePromise.resolve(req.query.code);
    res.end('done');
  });
  app.get('/register', (req, res) => {
    const manifest = createManifest(`${setupUrl}/code`, hookUrl);
    res.end(redirect(manifest));
  });
  console.log(`Go to ${setupUrl}/register to complete app setup`);
  const code = await codePromise;
  const response = await setupClient.apps.createFromManifest({ code });
  const config = {
    appId: response.data.id,
    privateKey: response.data.pem,
    secret: response.data.webhook_secret,
    clientId: response.data.client_id,
    clientSecret: response.data.client_secret,
  };
  return config;
};

export default register;