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

const queryFile = () => {
  return new Promise((resolve) => {
    pool.query('SELECT * FROM audiofiles', (err, res) => {
      let binary = res.rows[11].clip.toString('binary');
      //let buffer = Buffer.from(binary, 'base64');
      //console.log('RES!!!, decoded!!: ', buffer);
      resolve({clip: binary, id: res.rows[11].id});
    })
  })
}

const DownloadedFileType = new GraphQLObjectType({
    name: 'DownloadedFile',
    fields: {
      clip: { type: GraphQLString },
      id: { type: GraphQLInt }
    }
});

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
    },
    getfile: {
      type: DownloadedFileType,
      resolve: () => (queryFile().then(res => {
        console.log('IN RESOLVER:', res);
        //res.clip = res.clip.toString('base64');
        console.log(res);
        return res
      }))
    }
  })
});

export default query;