import { app } from '../functions/api/[[route]]';
import type { Env } from '../functions/lib/types';

interface WorkerEnv extends Env {
  ASSETS: Fetcher;
}

const API_PREFIX = '/api';

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(API_PREFIX)) {
      return app.fetch(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};
