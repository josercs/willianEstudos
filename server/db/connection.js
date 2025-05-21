// connection.js
import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  user: 'postgres',
  host: '192.168.0.108',
  database: 'Estudos',
  password: '1234',
  port: 5432,
});

client.connect();

export default client;