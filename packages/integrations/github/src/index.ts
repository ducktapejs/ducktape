import './types';
import { Client as DucktapeClient } from '@ducktapejs/server';
import Client, { Config } from './Client';
import Octokit from '@octokit/rest';
import WebhooksApi from '@octokit/webhooks';
import register from './register';

class GithubClient extends DucktapeClient<Config> {
  private _client?: Client;
  private _webhooks?: WebhooksApi;

  createConfig = register(this)
  
  async setup(config: Config) {
    this._client = new Client(config);
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