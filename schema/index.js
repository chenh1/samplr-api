import { GraphQLSchema } from 'graphql';
import mutation from './mutations';
import subscription from './subscriptions';
import query from './queries';
import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

export const schema = new GraphQLSchema({
  query,
  mutation,
  subscription
});