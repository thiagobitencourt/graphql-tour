const { makeExecutableSchema } = require('graphql-tools');

const typeDefs = `
    type Link {
        id: ID!
        url: String!
        description: String!
    }

    type Query {
        allLinks: [Link!]!
    }
`;

module.exports = makeExecutableSchema({ typeDefs });