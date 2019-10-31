import { Client } from '@ducktapejs/server';
import * as azdev from "azure-devops-node-api";

export type ConfigType = {
  accessToken: string;
  orgUrl: string;
}

class AzureDevOpsClient extends Client<ConfigType> {
  private _api?: azdev.WebApi;

  async healthCheck() {
    return true;
  }

  async createConfig() {
    const answers = await this.prompt([{
      type: 'input',
      name: 'orgUrl',
      message: 'Organization url (https://dev.azure.com/yourorgname)',
    }, {
      type: 'input',
      name: 'accessToken',
      message: 'access token',
    }]);
    return answers;
  }

  async setup(config: ConfigType) {
    const authHandler = azdev.getPersonalAccessTokenHandler(config.accessToken); 
    this._api = new azdev.WebApi(config.orgUrl, authHandler); 
  }

  get api() {
    if (!this._api) {
      throw new Error('Api not initialized');
    }
    return this._api;
  }
}

export default AzureDevOpsClient;