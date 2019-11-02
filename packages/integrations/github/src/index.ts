import './types';
import { Request, Response } from 'express';
import querystring from 'querystring';
import { Client as DucktapeClient } from '@ducktapejs/server';
import Client, { Config } from './Client';
import Octokit from '@octokit/rest';
import WebhooksApi from '@octokit/webhooks';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import register from './register';

class GithubClient extends DucktapeClient<Config> {
  private _client?: Client;
  private _webhooks?: WebhooksApi;
  private _config?: Config;

  createConfig = register(this)
  
  async setup(config: Config) {
    this._config = config;
    this._client = new Client(config);
    this._webhooks = new WebhooksApi({
      secret: config.secret,
    });
    this.registerMiddleware({ name: 'hooks' }, this._webhooks.middleware);
  }

  get hooks() {
    if (!this._webhooks) {
      throw new Error('Hooks not initialized');
    }
    return this._webhooks;
  }

  private get client() {
    if (!this._client) {
      throw new Error('Client is not initialized');
    }
    return this._client;
  }

  getLoginUrl = (redirectUrl: string, stateId?: string) => {
    if (!this._config) {
      throw new Error('Integration not initialized');
    }
    const query = querystring.stringify({
      client_id: this._config.clientId,
      redirect_url: redirectUrl,
      state: stateId,
      scope: 'user read:org',
    });
    return `https://github.com/login/oauth/authorize?${query}`;
  }

  onLoginCompleted = async (req: Request, res: Response) => {
    if (!this._config) {
      throw new Error('Instance not initialzied');
    }
    const { code, state } = req.query;
    const auth = createOAuthAppAuth({
      clientId: this._config.clientId,
      clientSecret: this._config.clientSecret,
      code,
      state,
    });
    const token = await auth({
      type: 'token',
    });
    const client = new Octokit({
      auth: token.token,
    });
    const user = await client.users.getAuthenticated();
    const orgs = await client.orgs.listForAuthenticatedUser();
    return {
      id: user.data.id,
      login: user.data.login,
      orgs: orgs.data.map(o =>o.login),
    };
  }

  getUser = async (data: any) => {
    return data;
  }

  async healthCheck() {
    const client = await this.client.getAppClient();
    const self = await client.apps.getAuthenticated();
    return !!self.data.name;
  }

  async getClient(owner: string, repo: string): Promise<Octokit> {
    const client = await this.client.getClient(owner, repo);
    return client;
  }
};

export default GithubClient;