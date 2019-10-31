import { Client } from '@ducktapejs/server';
import axios from 'axios';
import Transitions from './responses/Transitions';

export type ConfigType = {
  apiUrl: string;
  username: string;
  apiToken: string;
};

export type Options = {
  customFields: {[name: string]: string};
};

type ApiOptions = {
  baseURL: string;
  auth: {
    username: string;
    password: string;
  };
};

class JiraClient extends Client<ConfigType> {
  private _apiOptions?: ApiOptions;
  private _customFields: {[name: string]: string};

  constructor({
    customFields,
  }: Options) {
    super();
    this._customFields = customFields;
  }

  async healthCheck() {
    const { data } = await axios.get('2/status', this.apiOptions);
    return data.length > 0;
  }

  async createConfig() {
    const answers = await this.prompt([{
      type: 'input',
      name: 'apiUrl',
      message: 'Api url (format: https://exmaple.atlassian.net/rest/api)',
    }, {
      type: 'input',
      name: 'username',
      message: 'Username',
    }, {
      type: 'input',
      name: 'apiToken',
      message: 'Api token',
    }]);

    return {
      apiUrl: answers.apiUrl,
      username: answers.username,
      apiToken: answers.apiToken,
    };
  }

  async setup(config: ConfigType) {
    this._apiOptions = {
      baseURL: config.apiUrl,
      auth: {
        username: config.username,
        password: config.apiToken,
      },
    };
  }

  private get apiOptions() {
    if (!this._apiOptions) {
      throw new Error('Api options not initialized');
    }
    return this._apiOptions;
  }

  async updateField(id: string, field: string, value: any) {
    await axios.put(`2/issue/${id}`, {
      fields: {
        [this._customFields[field] || field]: value,
      },
    }, this.apiOptions);
  }

  async updateFilter(id: string, name: string, jql: string) {
    await axios.put(`3/filter/${id}`, {
      name,
      jql,
    }, this.apiOptions);
  }

  async getTransitions(id: string) {
    const { data } = await axios.get<Transitions>(`2/issue/${id}/transitions`, this.apiOptions);
    return data;
  }

  async transitionIssue(id: string, transitionId: string) {
    await axios.post(`2/issue/${id}/transitions`, {
      transition: transitionId,
    }, this.apiOptions);
  }
}

export default JiraClient;