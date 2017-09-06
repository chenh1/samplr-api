import mutation from './mutations';
import query from './queries';
import subscription from './subscriptions';

const schema = new GraphQLSchema({
  query,
  mutation,
  subscription
});

export default schema;