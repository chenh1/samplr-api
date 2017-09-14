import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import bodyParser from 'body-parser';
import { schema } from './schema';
import multer from 'multer';

const app = express();
const storage = multer.memoryStorage();

app.use(cors());
app.set('port', (process.env.PORT || 4000));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/graphql', multer({ storage }).any());

const server = createServer(app);

app.post('/graphql', graphqlHTTP(
  (req, res) => {
    return {
      schema: schema, 
      graphiql: true,
      rootValue: req,
      context: req
    }
  }
));

app.get('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
}));

server.listen(app.get('port'), () => {
  new SubscriptionServer({schema, execute, subscribe}, {server, path: '/subscriptions'});
  console.log("Running on localhost:" + app.get('port')); 
});