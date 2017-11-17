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

module.exports = {
    Query: {
        allLinks: async (root, data, { mongo: { Links }}) => {
            return await Links.find({}).toArray();
        }
    },
    Mutation: {
        createLink: async (root, data, { mongo: { Links }}) => {
            const response = await Links.insert(data);
            return Object.assign({ id: response.insertedIds[0]}, data);
        },
        createUser: async (root, data, { mongo: { Users }}) => {
            const newUser = {
                name: data.name,
                email: data.authProvider.email.email,
                password: data.authProvider.email.password,
            };
            const response = await Users.inser(newUser);
            return Object.assign({ id: response.insertedIds[0]}, newUser);
        }
    },
    Link: {
        id: root => root._id || root.id,
    }
}