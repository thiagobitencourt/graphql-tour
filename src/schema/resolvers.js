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
    Link: { 
        id: resolveId,
        postedBy: async ({ postedById }, data, { mongo: { Users }}) => {
            return await Users.findOne({ _id: postedById });
        }
    },
    User: { id: resolveId }
}