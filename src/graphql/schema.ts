import { makeExecutableSchema } from 'graphql-tools';

const users: any[] = [
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
]

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

const resolvers = {
    Query: {
        allUsers: () => users
    },
    Mutation: {
        createUser: (parent, args, context, info) => {
            //camada de persistência
            //Object.assign: extende o objeto inicial criando os dois novos campos (name e email) que vem do args
            const newUser = Object.assign({id: users.length + 1}, args);
            users.push(newUser);
            return newUser;
        }
    }
}

export default makeExecutableSchema({typeDefs, resolvers});