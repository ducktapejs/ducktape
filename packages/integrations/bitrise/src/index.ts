import { Client } from '@ducktapejs/server';

class DummyClient extends Client {
  async healthCheck() {
    return true;
  }

  async createConfig() {
    return true;
  }

  async setup() {
  }
}

export default DummyClient;