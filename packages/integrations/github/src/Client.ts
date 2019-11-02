import { App } from '@octokit/app';
import { request } from '@octokit/request';
import Octokit from '@octokit/rest';

type Config = {
  appId: number;
  secret: string;
  privateKey: string;
  clientId: string;
  clientSecret: string;
}

class Client {
  private _app: App;
  private _clients: {[name: string]: Octokit} = {};

  constructor({
    appId,
    privateKey,
  }: Config) {
    this._app = new App({
      id: appId,
      privateKey,
    });
  }

  getAppClient() {
    const jwt = this._app.getSignedJsonWebToken();
    const client = new Octokit({
      auth: `bearer ${jwt}`,
    });
    return client;
  }

  async getClient(owner: string, repo: string) {
    const name = `${owner}/${repo}`;
    if (!this._clients[name]) {
      const jwt = this._app.getSignedJsonWebToken();
      const { data } = await request("GET /repos/:owner/:repo/installation", {
        owner,
        repo,
        headers: {
          authorization: `Bearer ${jwt}`,
          accept: "application/vnd.github.machine-man-preview+json"
        }
      });
      const installationId = data.id;
      const installationAccessToken = await this._app.getInstallationAccessToken({
        installationId,
      });
      const client = new Octokit({
        auth: `token ${installationAccessToken}`,
      });
      this._clients[name] = client;
    }
    return this._clients[name];
  }
}

export {
  Config,
};

export default Client;