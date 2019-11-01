import { Client, HookInput } from '@ducktapejs/server';

type Listener<Type = any> = (evt: HookInput<Type>) => void;

class WebhookClient<PostType> extends Client {
  private _listeners: Listener<PostType>[] = [];
  private _url?: string;

  async healthCheck() {
    return true;
  }

  async createConfig() {
    return true;
  }

  async setup() {
    this._url = this.registerHook({
      name: 'hook',
    }, this.handle)
  }

  get url() {
    if (!this._url) {
      throw new Error('Url not initialized');
    }
    return this._url;
  }

  handle = async (input: any) => {
    this._listeners.forEach(l => l(input));
  }

  listen(fn: Listener) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(f => f !== fn);
    }
  }
}

export default WebhookClient;