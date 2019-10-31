import { Client } from '@ducktapejs/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export type ConfigType = {
  issuer: string;
  keyId: string;
  authKey: string;
};

class AppStoreConnectClient extends Client<ConfigType> {
  private _config?: ConfigType;
  
  async healthCheck() {
    try {
      await this.getBuilds();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async createConfig() {
    const answers = await this.prompt([{
      name: 'keyId',
      message: 'Key ID',
    }, {
      name: 'issuer',
      message: 'Issuer ID',
    }, {
      type: 'editor',
      name: 'authKey',
      message: 'Auth Key (.p8)',
    }]);
    return answers;
  }

  async setup(config: ConfigType) {
    this._config = config;
  }

  private get config() {
    if (!this._config) {
      throw new Error('Config not initialized');
    }
    return this._config;
  }

  private createToken () {
    const {
      issuer,
      keyId,
      authKey,
    } = this.config;
    const token = jwt.sign({
      iss: issuer,
      exp: new Date(new Date().getTime() + 1000 * 60 * 15).getTime() / 1000,
      aud: 'appstoreconnect-v1',
    }, authKey, {
      algorithm: 'ES256',
      keyid: keyId,
      noTimestamp: true,
    });
    return token;
  }

  private getApiOptions() {
    const token = this.createToken();

    return {
      baseURL: `https://api.appstoreconnect.apple.com/`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  async getBuilds() {
    const { data } = await axios.get('v1/builds', this.getApiOptions());
    return data;
  }

  async submitForBetaReview(buildId: string) {
    await axios.post('v1/betaAppReviewSubmissions', {
      data: {
        relationships: {
          build: {
            data: {
              id: buildId,
              type: 'builds',
            },
          },
        },
        type: 'betaAppReviewSubmissions',
      },
    }, this.getApiOptions());

  }
}

export default AppStoreConnectClient;