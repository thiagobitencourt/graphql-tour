const { MongoClient } = require('mongodb');

const dbUsername = 'graph';
const dbPassword = 'graph';

const MONGO_URL = `mongodb://${dbUsername}:${dbPassword}@ds111476.mlab.com:11476/graphql-tour`;

module.exports = async () => {
    const db = await MongoClient.connect(MONGO_URL);
    return { 
        Links: db.collection('links'),
        Users: db.collection('users'),
        Votes: db.collection('votes'),
    };
}