import jwt from 'jsonwebtoken';
import express, { RequestHandler } from 'express';
import uuid from 'uuid/v4';
import Client from '../Client';

export type TokenData<Type> = {
  integration: string,
  data: Type,
}

type LoginSession = {
  client: string;
}

const create = <T extends {[name: string]: Client}>(url: string, clients: T, secret: string) => {
  const loginSessions: {[name: string]: LoginSession} = {};
  const createToken = (clientName: string, data: any) => {
    const token = jwt.sign({
      integration: clientName,
      data,
    }, secret);
    return token;
  }

  const handler: RequestHandler = async (req, res, next) => {
    const fail = () => {
      res.clearCookie('token');
      res.status(401).end('Token validation failed');
    };
  
    const token = req.cookies.token;
    if (token) {
      const data = jwt.verify(token, secret) as TokenData<any>;
      const client = clients[data.integration];
      if (!client || !client.getUser) {
        return fail();
      }
      const user = await client.getUser(data.data);
      req.user = {
        integration: data.integration,
        data: user,
      };
    }
    next();
  };

  const middleware = express();
  middleware.get('/login', (req, res) => {
    const providers = Object.keys(clients)
      .filter((name) => clients[name].getLoginUrl);
    res.json(providers);
  });

  middleware.get('/login/:name', (req, res) => {
    const clientName = req.params.name;
    const client = clients[clientName];
    const stateId = uuid();
    loginSessions[stateId] = {
      client: clientName,
    };
    if (!client.getLoginUrl) {
      return res.status(400).end('err');
    }
    
    const loginUrl = client.getLoginUrl(url, stateId);
    res.redirect(loginUrl);
  });

  middleware.get('/login-callback', async (req, res) => {
    const stateId = req.query.state as string;
    const state = loginSessions[stateId];
    const client = clients[state.client];
    if (!client.onLoginCompleted) {
      return res.status(400).end('err');
    }
    const data = await client.onLoginCompleted(req, res);
    const token = createToken(state.client, data);
    res.cookie('token', token);
    res.end('done');
  });

  middleware.use(handler);

  return {
    middleware,
    createToken,
  };
}

export default create;
