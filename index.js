import express from 'express';
import cors from 'cors';
import { Pool, Client } from 'pg';
import graphqlHTTP from 'express-graphql';
import { buildSchema, GraphQLObjectType, GraphQLSchema, GraphQLInt, GraphQLString } from 'graphql';

//POSTGRES BEGINS
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/';
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

const pool = new Pool(connectParams);

const client = new Client(connectParams);

client.connect()

//const text = 'INSERT INTO persons(personid, lastname, firstname, address, city) VALUES($1, $2, $3, $4, $5) RETURNING *';
//const values = ['5', 'Chen', 'Howard', '123 Main St', 'Anywhere'];

//client.query(text, values, (err, res) => {
  client.end();
//});

pool.query('SELECT * FROM persons', (err, res) => {
  console.log(res.rows[0]);
});

let personData = {};
const getPersonData = () => {
  return new Promise((resolve) => {
    pool.query('SELECT * FROM persons', (err, res) => {
      resolve(res.rows[0].personid);
    });
  });
}
// Construct a schema, using GraphQL schema language
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      personid: {
        type: GraphQLInt,
        resolve: () => {
          return new Promise((resolve) => {
            pool.query('SELECT * FROM persons', (err, res) => {
              resolve(res.rows[0].personid);
            });
          })
        }
      },
      lastName: {
        type: GraphQLString,
        resolve: () => {
          return new Promise((resolve) => {
            pool.query('SELECT * FROM persons', (err, res) => {
              resolve(res.rows[0].lastname);
            });
          })
        }
      },
      firstname: {
        type: GraphQLString,
        resolve: () => {
          return new Promise((resolve) => {
            pool.query('SELECT * FROM persons', (err, res) => {
              resolve(res.rows[0].firstname);
            });
          })
        }
      },
      address: {
        type: GraphQLString,
        resolve: () => {
          return new Promise((resolve) => {
            pool.query('SELECT * FROM persons', (err, res) => {
              resolve(res.rows[0].address);
            });
          })
        }
      },
      city: {
        type: GraphQLString,
        resolve: () => {
          return new Promise((resolve) => {
            pool.query('SELECT * FROM persons', (err, res) => {
              resolve(res.rows[0].city);
            });
          })
        }
      }
    })
  })
})

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.listen(4000);

//EXPRESS BEGINS
/*
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
*/