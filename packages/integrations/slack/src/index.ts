import { Client } from '@ducktapejs/server';
import { WebClient } from '@slack/web-api';
import { RTMClient } from '@slack/rtm-api';

export type ConfigType = {
  token: string;
}

class SlackClient extends Client<ConfigType> {
  private _api?: WebClient;
  private _realtime?: RTMClient;

  async healthCheck() {
    return true;
  }

  async createConfig() {
    const answers = await this.prompt({
      type: 'input',
      name: 'token',
      message: 'Bot token',
    });
    return answers;
  }

  async setup(config: ConfigType) {
    this._api = new WebClient(config.token);
    this._realtime = new RTMClient(config.token);
    await this._realtime.start();
  }

  get api() {
    if (!this._api) {
      throw new Error('API not initialized');
    }
    return this._api;
  }

  get realtime() {
    if (!this._realtime) {
      throw new Error('Realtime not initialized');
    }
    return this._realtime;
  }
}

export default SlackClient;