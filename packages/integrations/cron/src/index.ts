import { Client } from '@ducktapejs/server';
import cron from 'node-cron';

class CronClient extends Client {
  async healthCheck() {
    return true;
  }

  async createConfig() {
    return true;
  }

  async setup() {
  }

  validate = cron.validate.bind(cron)

  schedule = cron.schedule.bind(cron)
}

export default CronClient;