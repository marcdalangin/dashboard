import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export function getDb(): NeonQueryFunction<false, false> | null {
  if (!connectionString) {
    return null;
  }
  return neon(connectionString);
}

export function isNeonConfigured(): boolean {
  return !!connectionString;
}
