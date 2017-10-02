import { GraphQLObjectType, GraphQLBoolean, GraphQLString, GraphQLInt } from 'graphql';
import { pubsub } from '../index';

const subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: () => ({
      startPlayTriggered: {
        type: GraphQLBoolean,
        resolve: payload => ({ data: payload }),
        subscribe: () => pubsub.asyncIterator('startPlayTriggered')
      },
      stopTriggered: {
        type: GraphQLBoolean,
        resolve: payload => ({ data: payload }),
        subscribe: () => pubsub.asyncIterator('stopTriggered')
      },
      audioFileUploaded: {
        type: GraphQLInt,
        resolve: payload => payload.audioFileUploaded.id,
        subscribe: () => pubsub.asyncIterator('audioFileUploaded')
      },
      trackCreated: {
        type: GraphQLInt,
        resolve: payload => payload.trackCreated.id,
        subscribe: () => pubsub.asyncIterator('trackCreated')
      },
      trackDeleted: {
        type: GraphQLInt,
        resolve: payload => payload.trackDeleted.id,
        subscribe: () => pubsub.asyncIterator('trackDeleted')
      }
    })
});

export default subscription;