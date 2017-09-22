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

const uploadToDB = (file, sessionId, trackId) => {
    return new Promise((resolve) => {
        pool.query(`SELECT * FROM audiofiles WHERE trackid = $1`, [trackId], (err, res) => {
            if (res.rows.length > 0) {
                pool.query(`UPDATE audiofiles SET clip=$1 WHERE trackid=$2 returning id`, [file, trackId], (err, res) => {
                    resolve(res.rows[0]);
                })
            } else {
                pool.query(`INSERT INTO audiofiles(clip, sessionid, trackid) VALUES ($1, $2, $3) returning id`, [file, sessionId, trackId], (err, res) => {
                    resolve(res.rows[0]);
                })
            }
        })
    })
}

const createTrackToDB = (sessionId) => {
    return new Promise((resolve) => {
        pool.query(`INSERT INTO tracks(sessionid) VALUES ($1) returning id`, [sessionId], (err, res) => {
            console.log('added track in query ', res.rows[0])
            resolve(res.rows[0]);
        })
    })
};

//DELETE FROM tracks WHERE trackid = $1, [trackId]
const deleteTrackFromDB = (trackId) => {
    console.log('DELETED TRACK: ', trackId);
    return new Promise((resolve) => {
        pool.query(`UPDATE tracks SET deleted=true WHERE id=$1 returning id`, [trackId], (err, res) => {
            console.log('added track in query ', res.rows[0])
            resolve(res.rows[0]);
        })
    })
}

//DELETE THIS WHEN WE DON'T NEED IT ANYMORE
const UploadedFileType = new GraphQLObjectType({
    name: 'UploadedFile',
    fields: {
        originalname: { type: GraphQLString },
        mimetype: { type: GraphQLString }
    }
});

const FileType = new GraphQLObjectType({
    name: 'FileType',
    fields: {
        id: { type: GraphQLInt }
    }
})

const TrackType = new GraphQLObjectType({
    name: 'TrackType',
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
            type: FileType,
            args: {
                sessionid: { type: GraphQLInt },
                trackid: { type: GraphQLInt }
            },
            resolve: (rootValue, args) => {
                let encoded = rootValue.files[0].buffer.toString('base64');

                return uploadToDB(encoded, args.sessionid, args.trackid).then(
                res => pubsub.publish('audioFileUploaded', {audioFileUploaded: res}))
            }
        },
        createTrack: {
            type: TrackType,
            args: {
                sessionid: { type: GraphQLInt }
            },
            resolve: (rootValue, args) => (createTrackToDB(args.sessionid).then(
                res => pubsub.publish('trackCreated', {trackCreated: res})
            ))
        },
        deleteTrack: {
            type: TrackType,
            args: {
                trackid: { type: GraphQLInt }
            },
            resolve: (rootValue, args) => (deleteTrackFromDB(args.trackid).then(
                res => pubsub.publish('trackDeleted', {trackDeleted: res})
            ))
        }
    })
});

export default mutation;