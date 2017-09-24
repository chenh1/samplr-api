import { GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString, GraphQLBoolean } from 'graphql';
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
      })
    }
  });
};

const returnFileList = (list) => (
  list.rows.map((row) => {
    return {
      clip: row.clip.toString('binary'),
      id: row.id,
      trackid: row.trackid
    }
  })
);

//NEED SINGLE FILE RETRIEVAL
const queryFiles = (sessionId, trackId) => {
  return new Promise((resolve) => {
    if (sessionId) {
      pool.query('SELECT * FROM audiofiles WHERE sessionid=$1', [sessionId], (err, res) => {
        resolve(returnFileList(res));
      })
    } else {
      pool.query('SELECT * FROM audiofiles WHERE trackid=$1', [trackId], (err, res) => {
        resolve(returnFileList(res));
      })
    }
  });
};

const queryTracks = (sessionId, trackId) => {
  console.log(sessionId, trackId)
  return new Promise((resolve) => {
    if (sessionId) {
      pool.query('SELECT * FROM tracks WHERE deleted=false and sessionid=$1',[sessionId], (err, res) => {
        resolve(res.rows);
      })
    } else {
      pool.query('SELECT * FROM tracks WHERE deleted=false and id=$1',[trackId], (err, res) => {
        resolve(res.rows);
      })
    }
  })
}

const DownloadedFileType = new GraphQLObjectType({
    name: 'DownloadedFile',
    fields: {
      clip: { type: GraphQLString },
      id: { type: GraphQLInt },
      trackid: { type: GraphQLInt }
    }
});

const TrackType = new GraphQLObjectType({
  name: 'Track',
  fields: {
    id: { type: GraphQLInt },
    sessionid: { type: GraphQLInt }
  }
})

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
    getFiles: {
      type: new GraphQLList(DownloadedFileType),
      args: {
        sessionid: {type: GraphQLInt },
        id: { type: GraphQLInt }
      },
      resolve: (rootValue, args) => (queryFiles(args.sessionid, args.id).then(res => res))
    },
    getTracks: {
      type: new GraphQLList(TrackType),
      args: {
        sessionid: { type: GraphQLInt },
        id: { type: GraphQLInt }
      },
      resolve: (rootValue, args) => (queryTracks(args.sessionid, args.id).then(res=>res))
    }
  })
});

export default query;