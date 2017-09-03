import express from 'express';
import events from 'events';
import cors from 'cors';
import { Pool, Client } from 'pg';
import graphqlHTTP from 'express-graphql';
import { buildSchema, GraphQLObjectType, GraphQLSchema, GraphQLInt, GraphQLString, GraphQLBoolean } from 'graphql';

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

//client.connect()

//const text = 'INSERT INTO persons(personid, lastname, firstname, address, city) VALUES($1, $2, $3, $4, $5) RETURNING *';
//const values = ['5', 'Chen', 'Howard', '123 Main St', 'Anywhere'];

//client.query(text, values, (err, res) => {
  //client.end();
//})

let personData = {};
let dataLoad = new events.EventEmitter();
let dataNodes = 0;

const resetValues = () => {
  if (dataNodes === 0) {
    personData = {};
    dataLoad = new events.EventEmitter();
  }
}

const setPersonData = (set, key) => {
  dataNodes--;
  personData = Object.assign({}, personData, set);
  console.log('personData: ', personData);
  dataLoad.emit('loaded');

  resetValues();

  return set[key];
}

const getPersonData = (prop) => {
  dataNodes--;
  console.log('count: ', dataNodes);

  resetValues();

  return prop;
}


const queryData = (key, table) => {
  dataNodes++;
  console.log('in query, after incrementing: ', dataNodes)
  return new Promise((resolve) => {
    console.log('in query: ', personData);
    if (Object.keys(personData).length) {
      dataLoad.on('loaded', () => {
        resolve(getPersonData(personData[key]));
      });
    } else {
      console.log('queried');
      personData.loading = true;
      pool.query('SELECT * FROM ' + table, (err, res) => {
        resolve(setPersonData(res.rows[0], key));
      });
    }
  });
}
// Construct a schema, using GraphQL schema language
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      personid: {
        type: GraphQLInt,
        resolve: () => (queryData('personid', 'persons'))
      },
      lastname: {
        type: GraphQLString,
        resolve: () => (queryData('lastname', 'persons'))
      },
      firstname: {
        type: GraphQLString,
        resolve: () => (queryData('firstname', 'persons'))
      },
      address: {
        type: GraphQLString,
        resolve: () => (queryData('address', 'persons'))
      },
      city: {
        type: GraphQLString,
        resolve: () => (queryData('city', 'persons'))
      },
      sessionid: {
        type: GraphQLInt,
        resolve: () => (queryData('id', 'sessions'))
      },
      play: {
        type: GraphQLBoolean,
        resolve: () => (queryData('play', 'sessions'))
      },
      recording: {
        type: GraphQLBoolean,
        resolve: () => (queryData('recording', 'sessions'))
      },
      tempo: {
        type: GraphQLInt,
        resolve: () => (queryData('tempo', 'sessions'))
      },
      livenode: {
        type: GraphQLInt,
        resolve: () => (queryData('livenode', 'sessions'))
      }
    })
  })
})

const app = express();
app.use(cors());
app.set('port', (process.env.PORT || 4000));

app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: false,
}));

/*
app.get('/tracks', function(req, res) {
  res.json([
    {"id": 1, "divisions": 4},
    {"id": 2, "divisions": 16},
    {"id": 3, "divisions": 3},
    {"id": 4, "divisions": 8},
    {"id": 5, "divisions": 2}
  ]);
});*/

app.listen(app.get('port'), function() {
  console.log("Running on localhost:" + app.get('port')); 
});

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

app.listen(app.get('port'), function() {
  console.log("Running on localhost:" + app.get('port')); 
});
*/