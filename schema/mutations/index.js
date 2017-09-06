import { GraphQLObjectType, GraphQLBoolean } from 'graphql';

const updateData = (isPlay) => {
  return new Promise((resolve) => {
    pool.query('UPDATE sessions SET play = '+ isPlay +' WHERE id = 1', (err, res) => {
      console.log('updated', res);
      resolve(res);
    })
  })
};

const mutation = new GraphQLObjectType({
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
  });

  export default mutation;