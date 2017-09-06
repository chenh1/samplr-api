import { Pool, Client } from 'pg';

const connectionString = process.env.DATABASE_URL || '';
const connectParams = connectionString === process.env.DATABASE_URL ?
  {
    connectionString: connectionString,
    ssl: true
  }
  :
  {
    user: 'postgres',
    host: 'localhost',
    database: 'myDb',
    password: 'postgres',
    port: 5432
  };

export const pool = new Pool(connectParams);
export const client = new Client(connectParams);