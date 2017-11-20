const { ObjectID } = require('mongodb');

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

module.exports = {
    Query: {
        allLinks: async (root, data, { mongo: { Links }}) => {
            return await Links.find({}).toArray();
        }
    },
    Mutation: {
        createLink: async (root, data, { mongo: { Links }, user }) => {
            const newLink = Object.assign({ postedById: user && user._id}, data);
            const response = await Links.insert(newLink);
            return Object.assign({ id: response.insertedIds[0]}, newLink);
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
        postedBy: async ({ postedById }, data, { mongo: { Users }}) => {
            return await Users.findOne({ _id: postedById });
        },
        votes: async ({ _id }, data, { mongo: { Votes }}) => {
            return await Votes.find({ linkId: _id }).toArray();
        },
    },
    Vote: {
        id: resolveId,
        user: async ({ userId }, data, { mongo: { Users }}) => {
            return await Users.findOne({ _id: userId });
        },
        link: async ({ linkId }, data, { mongo: { Links }}) => {
            return await Links.findOne({ _id: linkId });
        }
    }
}