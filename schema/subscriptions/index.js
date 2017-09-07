import { GraphQLObjectType, GraphQLBoolean } from 'graphql';
import { pubsub } from '../index';

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