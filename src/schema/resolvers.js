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
        allLinks: () => links,
    },
    Mutation: {
        createLink: (_, data) => {
            const newLink = Object.assign({ id: links.length + 1 }, data);
            links.push(newLink);
            return newLink;
        }
    }
}