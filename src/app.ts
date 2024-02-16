import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { Env } from './types';

export const app = new Hono<{ Bindings: Env }>();

app.use(prettyJSON());
