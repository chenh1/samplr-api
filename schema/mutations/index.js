import { GraphQLObjectType, GraphQLBoolean, GraphQLString, GraphQL } from 'graphql';
import { pool } from '../../server';
import { pubsub } from '../index';

const updateData = (isPlay, testParam) => {
    console.log('stopped request: ', testParam);
    return new Promise((resolve) => {
        pool.query('UPDATE sessions SET play = '+ isPlay +' WHERE id = 1', (err, res) => {
            console.log('updated', res);
            resolve(res);
        })
    })
};

const uploadToDB = (file) => {
    console.log('IN UPLOAD: ', file)
    return new Promise((resolve) => {
        pool.query(`INSERT INTO audiofiles(clip, trackid) VALUES ($1, $2)`, [file, 1], (err, res) => {
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
            resolve: (rootValue) => {
                let encoded = rootValue.files[0].buffer.toString('base64');

                return uploadToDB(encoded).then(
                res => pubsub.publish('audioFileUploaded', {audioFileUploaded: res}))
            }
        }
    })
});

export default mutation;