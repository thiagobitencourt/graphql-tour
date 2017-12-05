const { ObjectID } = require('mongodb');
const { URL } = require('url');
const pubsub = require('../pubsub');

const links = [
    {
        id: 1,
        url: 'http://graphql.org/',
        description: 'The best query language'
    },
    {
        id: 2,
        url: 'http://dev.apollodata.com',
        description: 'Awesome GraphQL client'
    },
];

let resolveId = root => root._id || root.id;

class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
    }
}

function assertValidLink({ url }) {
    try {
        new URL(url);
    } catch(error) {
        throw new ValidationError('Link validation error: invalid url.', 'url');
    }
}

module.exports = {
    Subscription: {
        Link: {
            subscribe: () => pubsub.asyncIterator('Link'),
        }
    },
    Query: {
        allLinks: async (root, data, { mongo: { Links }}) => {
            return await Links.find({}).toArray();
        }
    },
    Mutation: {
        createLink: async (root, data, { mongo: { Links }, user }) => {
            assertValidLink(data);
            const newLink = Object.assign({ postedById: user && user._id}, data);
            const response = await Links.insert(newLink);

            newLink.id = response.insertedIds[0];
            pubsub.publish('Link', { Link: { mutation: 'CREATED', node: newLink }});

            return newLink;
        },
        createVote: async (root, data, { mongo: { Votes }, user }) => {
            const newVote = {
                userId: user && user._id,
                linkId: new ObjectID(data.linkId),
            };
            const response = await Votes.insert(newVote);
            return Object.assign({ id: response.insertedIds[0]}, newVote);
        },
        createUser: async (root, data, { mongo: { Users }}) => {
            const newUser = {
                name: data.name,
                email: data.authProvider.email.email,
                password: data.authProvider.email.password,
            };
            const response = await Users.insert(newUser);
            return Object.assign({ id: response.insertedIds[0]}, newUser);
        },
        signinUser: async (root, data, { mongo: { Users }}) => {
            const user = await Users.findOne({ email: data.email.email });
            if(data.email.password === user.password) {
                return { token: `token-${user.email}`, user};
            }
        }
    },
    User: { 
        id: resolveId,
        votes: async ({ _id }, da, { mongo: { Votes }}) => {
            return await Votes.find({ userId: _id }).toArray();
        }
    },
    Link: { 
        id: resolveId,
        postedBy: async ({ postedById }, data, { dataloaders: { userLoader }}) => {
            return await userLoader.load(postedById);
        },
        votes: async ({ _id }, data, { mongo: { Votes }}) => {
            return await Votes.find({ linkId: _id }).toArray();
        },
    },
    Vote: {
        id: resolveId,
        user: async ({ userId }, data, { dataloaders: { userLoader }}) => {
            return await userLoader.load(userId);
        },
        link: async ({ linkId }, data, { mongo: { Links }}) => {
            return await Links.findOne({ _id: linkId });
        }
    }
}