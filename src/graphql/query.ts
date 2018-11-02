import { postQueries } from './resources/post/post.schema';
import { userQueries } from './resources/user/user.schema';

//interpolação de strings: ${}
const Query = `
    type Query {
        ${postQueries}
        ${userQueries}
    }
`;

export {
    Query
}