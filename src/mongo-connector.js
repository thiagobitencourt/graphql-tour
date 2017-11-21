const { Logger, MongoClient } = require('mongodb');

const dbUsername = 'graph';
const dbPassword = 'graph';

const MONGO_URL = `mongodb://${dbUsername}:${dbPassword}@ds111476.mlab.com:11476/graphql-tour`;

module.exports = async () => {
    const db = await MongoClient.connect(MONGO_URL);
    let logCount = 0;
    Logger.setCurrentLogger((msg, state) => {
        console.log(`MONGO DB REQUEST ${++logCount}: ${msg}`);
    });
    Logger.setLevel('debug');
    Logger.filter('class', ['Cursor']);

    return { 
        Links: db.collection('links'),
        Users: db.collection('users'),
        Votes: db.collection('votes'),
    };
}