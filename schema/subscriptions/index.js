import { GraphQLObjectType, GraphQLBoolean, GraphQLString } from 'graphql';
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
          console.log('in sub for stop ', payload);
          return {
            data: payload
          }
        },
        subscribe: () => pubsub.asyncIterator('stopTriggered')
      },
      audioFileUploaded: {
        type: GraphQLString,
        resolve: (payload) => {
          console.log('in sub for audio file ', payload);
          return {
            data: payload
          }
        },
        subscribe: () => pubsub.asyncIterator('audioFileUploaded')
      },
      trackCreated: {
        type: GraphQLBoolean,
        resolve: (payload) => {
          return {
            data: payload
          }
        },
        subscribe: () => pubsub.asyncIterator('trackCreated')
      },
      trackDeleted: {
        type: GraphQLString,
        resolve: (payload) => {
          return {
            data: payload
          }
        },
        subscribe: () => pubsub.asyncIterator('trackDeleted')
      }
    })
});

export default subscription;