import { GraphQLObjectType, GraphQLBoolean, GraphQLString, GraphQLInt } from 'graphql';
import { pool } from '../../server';
import { pubsub } from '../index';

const updateData = (isPlay, testParam) => {
    console.log('stopped request: ', testParam);
    return new Promise((resolve) => {
        pool.query('UPDATE sessions SET play = '+ isPlay +' WHERE id = 1', (err, res) => {
            resolve(res);
        })
    })
};

const uploadToDB = (file, trackId) => {
    return new Promise((resolve) => {
        pool.query(`INSERT INTO audiofiles(clip, trackid) VALUES ($1, $2)`, [file, trackId], (err, res) => {
            resolve(res);
        })
    })
}

const createTrackToDB = (sessionid) => {
    return new Promise((resolve) => {
        pool.query(`INSERT INTO tracks(sessionid) VALUES ($1)`, [1], (err, res) => {
            resolve(res);
        })
    })
}

const UploadedFileType = new GraphQLObjectType({
    name: 'UploadedFile',
    fields: {
        originalname: { type: GraphQLString },
        mimetype: { type: GraphQLString }
    }
});

const CreateTrackType = new GraphQLObjectType({
    name: 'CreateTrack',
    fields: {
        id: { type: GraphQLInt }
    }
})

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
            resolve: (rootValue) => (updateData('false', rootValue.body).then(
                res => pubsub.publish('stopTriggered', {stopTriggered: res})
            ))
        },
        uploadAudioFile: {
            type: UploadedFileType,
            args: {
                trackid: {type: GraphQLInt }
            },
            resolve: (rootValue, args) => {
                let encoded = rootValue.files[0].buffer.toString('base64');

                return uploadToDB(encoded, args.trackid).then(
                res => pubsub.publish('audioFileUploaded', {audioFileUploaded: res}))
            }
        },
        createTrack: {
            type: CreateTrackType,
            args: {
                sessionid: { type: GraphQLInt }
            },
            resolve: (rootValue, args) => {
                return createTrackToDB().then(
                    res => pubsub.publish('trackCreated', {trackCreated: res})
                )
            }
        }
    })
});

export default mutation;