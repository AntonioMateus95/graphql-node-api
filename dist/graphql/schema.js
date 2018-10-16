"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tools_1 = require("graphql-tools");
const users = [
    {
        id: 1,
        name: 'Jon',
        email: 'jon@email.com'
    },
    {
        id: 2,
        name: 'Dany',
        email: 'dany@email.com'
    }
];
const typeDefs = `
    type User {
        id: ID!
        name: String!
        email: String!
    }

    type Query {
        allUsers: [User!]!
    }

    type Mutation {
        createUser(name: String!, email: String!): User
    }
`;
//O GraphQL não nos obriga a criar resolvers triviais, pois campos de tipos escalares não precisam ser resolvidos
//Para simular a situação em que há a necessidade de resolvê-los, veja a implementação do resolver para o tipo User
const resolvers = {
    User: {
        id: (user) => user.id,
        name: (user) => user.name,
        email: (user) => user.email,
    },
    Query: {
        allUsers: () => users
    },
    Mutation: {
        createUser: (parent, args, context, info) => {
            //camada de persistência
            //Object.assign: extende o objeto inicial criando os dois novos campos (name e email) que vem do args
            const newUser = Object.assign({ id: users.length + 1 }, args);
            users.push(newUser);
            return newUser;
        }
    }
};
exports.default = graphql_tools_1.makeExecutableSchema({ typeDefs, resolvers });
