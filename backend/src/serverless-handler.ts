import { app } from './app';

const handler = (req: any, res: any) => {
  return app(req, res);
};

export default handler;
