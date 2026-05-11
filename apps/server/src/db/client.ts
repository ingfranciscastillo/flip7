import "dotenv/config";

import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import { env } from "../env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export const db = drizzle(env.DATABASE_URL);

export {schema}