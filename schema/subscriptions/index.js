import { GraphQLObjectType, GraphQLBoolean } from 'graphql';
import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

const subscription = new GraphQLObjectType({
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
});

export default subscription;