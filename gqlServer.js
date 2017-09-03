import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
  type Query {
    hello: Object
  }
`);

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => {
    return pool.query('SELECT * FROM persons', (err, res) => {
      console.log(res.rows[0])
      return {
        personid: res.rows[0].id,
        lastname: res.rows[0].lastname,
        firstname: res.rows[0].firstname,
        address: res.rows[0].address,
        city: res.rows[0].city
      };
    });
  },
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');