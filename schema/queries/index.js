import { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean } from 'graphql';
import { pool } from '../../server';
import events from 'events';

let dataBlock = {};
let dataLoad = new events.EventEmitter();
let dataNodes = 0;

const resetValues = () => {
  if (dataNodes === 0) {
    dataBlock = {};
    dataLoad = new events.EventEmitter();
  }
}

const setData = (set, key) => {
  dataNodes--;
  dataBlock = Object.assign({}, dataBlock, set);
  dataLoad.emit('loaded');

  resetValues();

  return set[key];
}

const getData = (prop) => {
  dataNodes--;

  resetValues();

  return prop;
}

const queryData = (key, table) => {
  dataNodes++;

  return new Promise((resolve) => {
    if (Object.keys(dataBlock).length) {
      dataLoad.on('loaded', () => {
        resolve(getData(dataBlock[key]));
      });
    } else {
      dataBlock.loading = true;
      pool.query('SELECT * FROM ' + table, (err, res) => {
        resolve(setData(res.rows[0], key));
      });
    }
  });
};

const query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      sessionid: {
        type: GraphQLInt,
        resolve: () => (queryData('id', 'sessions'))
      },
      play: {
        type: GraphQLBoolean,
        resolve: () => (queryData('play', 'sessions'))
      },
      recording: {
        type: GraphQLBoolean,
        resolve: () => (queryData('recording', 'sessions'))
      },
      tempo: {
        type: GraphQLInt,
        resolve: () => (queryData('tempo', 'sessions'))
      },
      livenode: {
        type: GraphQLInt,
        resolve: () => (queryData('livenode', 'sessions'))
      }
    })
});

export default query;