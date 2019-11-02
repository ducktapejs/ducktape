import { Express, RequestHandler, Response, Request } from 'express';
import inquirer from 'inquirer';
import createSession from './security/session';

export type HookOptions = {
  name: string;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
};

export type CoreSetup = {
  name: string;
  server: Express;
  url: string;
  session: ReturnType<typeof createSession>;
}

export type HookInput<Type> = {
  body: Type;
  query: {[name: string]: string}
  url: string;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
  headers: {[name: string]: (string | string[] | undefined)};
}

export type EndpointConfig = {
  url: string;
  method?: string;
  type: 'middleware' | 'hook';
}

type RegisterHook = <InputType>(config: HookOptions, callback: (input: HookInput<InputType>) => Promise<void>) => string;
type RegisterMiddleware = (config: HookOptions, handler: RequestHandler) => string;

export type ClientApi = {
  registerHook: RegisterHook;
  registerMiddleware: RegisterMiddleware;
  prompt: typeof inquirer.prompt;
}

abstract class Client<ConfigType = any> implements ClientApi {
  private _core?: CoreSetup;
  private _endpoints: EndpointConfig[] = [];

  abstract setup(config: ConfigType): Promise<void>;

  abstract healthCheck(): Promise<boolean | Error>;

  abstract createConfig(current?: ConfigType): Promise<ConfigType>;

  prompt = inquirer.prompt;

  async setupCore(core: CoreSetup) {
    this._core = core;
  }

  get endpoints() {
    return this._endpoints;
  }

  registerHook<InputType>(config: HookOptions, callback: (input: HookInput<InputType>) => Promise<void>) {
    if (!this._core) {
      throw new Error('Server not configured');
    }
    const url = `${this._core.url}/${config.name}`;
    this._core.server.post(`/${config.name}`, (req, res) => {
      callback({
        body: req.body as InputType,
        url: req.url,
        query: req.query,
        headers: req.headers,
      });
      res.end('accepted');
    });
    this._endpoints.push({
      url,
      method: config.method || 'POST',
      type: 'hook',
    })
    return url;
  }

  registerMiddleware(config: HookOptions, handler: RequestHandler) {
    if (!this._core) {
      throw new Error('Server not configured');
    }
    const url = `${this._core.url}/${config.name}`;
    this._core.server.use(`/${config.name}`, handler);
    this._endpoints.push({
      url,
      type: 'middleware',
    })
    return url;
  }

  getUser?: (data: any) => Promise<any>;
  getLoginUrl?: (redirectUrl: string, stateId?: string) => string
  onLoginCompleted?: (req: Request, res: Response) => Promise<any>
}

export default Client;