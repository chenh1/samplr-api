import express from 'express';
import cors from 'cors';
import { Pool, Client } from 'pg';

//POSTGRES BEGINS
const connectionString = process.env.DATABASE_URL || DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: true
})

pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})

const client = new Client({
  connectionString: connectionString,
  ssl: true
})
client.connect()

const text = 'INSERT INTO persons(personid, lastname, firstname, address, city) VALUES($1, $2, $3, $4, $5) RETURNING *';
const values = ['1', 'Chen', 'Howard', '123 Main St', 'Anywhere'];

client.query(text, values, (err, res) => {
  client.end();
});

//EXPRESS BEGINS

const app = express();
app.use(cors());

app.set('port', (process.env.PORT || 8000));

app.get('/', function(request, response) {
  response.send('Initialized')
});

app.get('/visibleEffect', function(req, res) {
  res.json([
    {"id": 0, "counter": 0}
  ]);
});

app.get('/tracks', function(req, res) {
  res.json([
    {"id": 1, "divisions": 4},
    {"id": 2, "divisions": 16},
    {"id": 3, "divisions": 3},
    {"id": 4, "divisions": 8},
    {"id": 5, "divisions": 2}
  ]);
});

app.listen(app.get('port'), function() {
  console.log("Running on localhost:" + app.get('port')); 
});