import { createServer } from 'http';
import express from 'express';
import events from 'events';
import cors from 'cors';
import { Pool, Client } from 'pg';
import graphqlHTTP from 'express-graphql';
import { execute, subscribe, buildSchema, GraphQLObjectType, GraphQLSchema, GraphQLInt, GraphQLString, GraphQLBoolean } from 'graphql';
import { PubSub, withFilter } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import bodyParser from 'body-parser';

const pubsub = new PubSub();
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

const updateData = (isPlay) => {
  console.log('updating', isPlay);
  return new Promise((resolve) => {
    pool.query('UPDATE sessions SET play = '+ isPlay +' WHERE id = 1', (err, res) => {
      console.log('updated', res);
      resolve(res);
    })
  })
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
  }),

  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      startPlay: {
        type: GraphQLBoolean,
        resolve: () => (updateData('true').then(
          res => pubsub.publish('startPlayTriggered', {startPlayTriggered: res})
        ))
      },
      stopPlay: {
        type: GraphQLBoolean,
        resolve: () => (updateData('false').then(
          res => pubsub.publish('stopTriggered', {stopTriggered: res})
        ))
      }
    })
  }),

  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: () => ({
      startPlayTriggered: {
        type: GraphQLBoolean,
        resolve: (payload) => {
          return {
            data: payload
          }
        },
        subscribe: () => pubsub.asyncIterator('startPlayTriggered')
      },
      stopTriggered: {
        type: GraphQLBoolean,
        resolve: (payload) => {
          return {
            data: payload
          }
        },
        subscribe: () => pubsub.asyncIterator('stopTriggered')
      }
    })
  })
})

const app = express();
app.use(cors());
app.set('port', (process.env.PORT || 4000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const server = createServer(app);

app.post('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: false,
}));

app.get('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: false,
}));

server.listen(app.get('port'), () => {
  new SubscriptionServer({schema, execute, subscribe}, {server, path: '/subscriptions'});
  console.log("Running on localhost:" + app.get('port')); 
});