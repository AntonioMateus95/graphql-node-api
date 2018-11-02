//tudo que escrevermos usando #, como no exemplo abaixo, é encarado
//como comentário, e usado no Graphi para informação adicional
/* No GraphQL quando queremos enviar dados através de uma mutation,
criamos tipos chamados inputs (parecidos com os DTOs do C#) */
const userTypes = `
    # User definition type 
    type User {
        id: ID!
        name: String!
        email: String!
        photo: String
        createdAt: String!
        updatedAt: String!
    }

    input UserCreateInput {
        # campo obrigatório
        name: String!
        email: String!
        password: String!
    }

    input UserUpdateInput {
        name: String!
        email: String!
        # uma foto é necessária na atualização, mas pode permitir nulo novamente
        photo: String
    }

    input UserUpdatePasswordInput {
        password: String!
    }
`;

const userQueries = `
    # retorna uma lista paginada baseada nos parâmetros enviados, ou em valores default
    users(limit: Int, offset: Int): [ User! ]!
    # get by id
    user(id: ID!): User
`;

const userMutations = `
    createUser(input: UserCreateInput!): User
    updateUser(id: ID!, input: UserUpdateInput!): User
    # retorna se a senha do usuário pôde ser alterada
    updateUserPassword(id: ID!, UserUpdatePasswordInput!): Boolean
    # retorna se o usuário pôde ser excluído
    deleteUser(id: ID!): Boolean
`; 

export { 
    userTypes,
    userQueries,
    userMutations
}