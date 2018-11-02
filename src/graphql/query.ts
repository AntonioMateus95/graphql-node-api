import { userQueries } from './resources/user/user.schema';

//interpolação de strings: ${}
const Query = `
    type Query {
        ${userQueries}
    }
`;

export {
    Query
}