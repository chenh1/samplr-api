import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';
import { execute, subscribe, buildSchema, GraphQLObjectType, GraphQLSchema, GraphQLInt, GraphQLString, GraphQLBoolean } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { mutation, query, subscription } from './schema';
import bodyParser from 'body-parser';
import schema from './schema';

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