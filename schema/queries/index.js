import { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean } from 'graphql';

let personData = {};
let dataLoad = new events.EventEmitter();
let dataNodes = 0;

const resetValues = () => {
  if (dataNodes === 0) {
    personData = {};
    dataLoad = new events.EventEmitter();
  }
}

const setPersonData = (set, key) => {
  dataNodes--;
  personData = Object.assign({}, personData, set);
  console.log('personData: ', personData);
  dataLoad.emit('loaded');

  resetValues();

  return set[key];
}

const getPersonData = (prop) => {
  dataNodes--;

  resetValues();

  return prop;
}

const queryData = (key, table) => {
  dataNodes++;

  return new Promise((resolve) => {
    if (Object.keys(personData).length) {
      dataLoad.on('loaded', () => {
        resolve(getPersonData(personData[key]));
      });
    } else {
      personData.loading = true;
      pool.query('SELECT * FROM ' + table, (err, res) => {
        resolve(setPersonData(res.rows[0], key));
      });
    }
  });
};

const query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      personid: {
        type: GraphQLInt,
        resolve: () => (queryData('personid', 'persons'))
      },
      lastname: {
        type: GraphQLString,
        resolve: () => (queryData('lastname', 'persons'))
      },
      firstname: {
        type: GraphQLString,
        resolve: () => (queryData('firstname', 'persons'))
      },
      address: {
        type: GraphQLString,
        resolve: () => (queryData('address', 'persons'))
      },
      city: {
        type: GraphQLString,
        resolve: () => (queryData('city', 'persons'))
      },
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