import { GraphQLResolveInfo } from 'graphql';
import * as graphqlFields from 'graphql-fields';

import { Transaction } from 'sequelize';
import { DbConnection } from './../../../interfaces/DbConnectionInterface';

import { PostInstance } from './../../../models/PostModel';
import { handleError, throwError } from '../../../utils/utils';
import { compose } from '../../composable/composable.resolver';
import { authResolvers } from '../../composable/auth.resolver';
import { AuthUser } from '../../../interfaces/AuthUserInterface';
import { DataLoaders } from '../../../interfaces/DataLoadersInterface';
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';

export const postResolvers = {

    Post: {
        author: (post, args, {dataLoaders: { userLoader }}: {dataLoaders: DataLoaders}, info: GraphQLResolveInfo) => {
            // a cada vez que este resolver for chamado, o user loader irá salvar o id requisitado dentro de uma lista
            // somente quando nenhum id for fornecido para essa lista, o userLoader transformará a lista de ids em um
            // conjunto e então usar este conjunto para pegar os respectivos autores 
            return userLoader
                .load({ key: post.get('author'), info: info })
                .catch(handleError);
        }, 
        
        comments: (post, { first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.Comment
                .findAll({
                    where: { post: post.get('id') },
                    limit: first,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info)
                })
                .catch(handleError);
        }
    },

    Query: {
        posts: (parent, { first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            //é possível especificar nos métodos do sequelize quais campos estão sendo buscados
            //através do atributo attributes 
            //olhar a sintaxe através do site http://docs.sequelizejs.com/manual/tutorial/querying.html
            return context.db.Post
                .findAll({
                    limit: first,
                    offset: offset,
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
                })
                .catch(handleError);
        }, 

        post: (parent, { id }, context: ResolverContext, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return context.db.Post
                .findById(id, {
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
                })
                .then((post: PostInstance) => {
                    throwError(!post, `Post with id ${id} not found!`);
                    return post;
                }).catch(handleError);
        }, 
    },

    Mutation: {

        createPost: compose(...authResolvers)((parent, { input }, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            input.author = authUser.id;
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .create(input, { transaction: t });
            }).catch(handleError);
        }),

        updatePost: compose(...authResolvers)((parent, { id, input }, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            //id do post
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then((post: PostInstance) => {
                        throwError(!post, `Post with id ${id} not found!`);
                        throwError(post.get('author') != authUser.id, 'Unauthorized! You can only edit posts by yourself!');
                        input.author = authUser.id;
                        return post.update(input, { transaction: t });
                    })
            }).catch(handleError);
        }),

        deletePost: compose(...authResolvers)((parent, { id }, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            //id do post
            id = parseInt(id)
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                .findById(id)
                .then((post: PostInstance) => {
                    throwError(!post, `Post with id ${id} not found!`);
                    throwError(post.get('author') != authUser.id, 'Unauthorized! You can only delete posts by yourself!');
                    return post.destroy({ transaction: t })
                        .then(post => !!post);
                }).catch(handleError);
            });
        })

    }
}