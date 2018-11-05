import { makeExecutableSchema } from 'graphql-tools';
import { merge } from 'lodash';

import {Query} from './query';
import {Mutation} from './mutation';

import { commentTypes } from './resources/comment/comment.schema';
import { postTypes } from './resources/post/post.schema';
import { userTypes } from './resources/user/user.schema';

import { commentResolvers } from './resources/comment/comment.resolvers';
import { postResolvers } from './resources/post/post.resolvers';
import { userResolvers } from './resources/user/user.resolvers';

//precisamos de uma forma de mesclar todas as queries e mutations feitas em arquivos separados:
//para isso usamos uma função do lodash chamada merge. Como o próprio nome já diz, ela pega os atributos iguais de uma série de objetos e mescla os seus conteúdos
const resolvers = merge(commentResolvers, postResolvers, userResolvers);

const SchemaDefinition = `
    type Schema {
        query: Query
        mutation: Mutation
    }
`; 

export default makeExecutableSchema({
    typeDefs: [
        SchemaDefinition,
        Query,
        Mutation,
        commentTypes,
        postTypes,
        userTypes
    ],
    resolvers
});