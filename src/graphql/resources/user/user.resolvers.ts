import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { UserInstance } from "../../../models/UserModel";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";
import { RequestedFields } from "../../ast/RequestedFields";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";

//artimanha do EcmaScript 6: desestruturação de objetos
export const userResolvers = {
    User: {
        posts: (user: UserInstance, { first = 10, offset = 0 }, {db, requestedFields}: {db: DbConnection, requestedFields: RequestedFields}, info: GraphQLResolveInfo) => {
            //uma instância do sequelize possui um método get para retornar o valor de um atributo do objeto que estamos trabalhando
            return db.Post.findAll({
                where: { author: user.get('id') },
                limit: first,
                offset: offset,
                attributes: requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
            }).catch(handleError);
        }
    },
    Query: {
        users: (parent, { limit = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            //deverá ser feito um select em nosso banco de dados para retornar uma lista paginada de usuários
            return context.db.User.findAll({
                limit: limit,
                offset: offset,
                attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
            }).catch(handleError);
        },
        user: (parent, {id}, context: ResolverContext, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return context.db.User.findById(id, {
                attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
            })
            .then((user: UserInstance) => {
                throwError(!user, `User with id ${id} not found`);
                return user;
            }).catch(handleError);
        }, 
        currentUser: compose(...authResolvers)((parent, args, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.User
                .findById(context.authUser.id, {
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
                })
                .then((user: UserInstance) => {
                    throwError(!user, `User with id ${context.authUser.id} not found`);
                    return user;
                }).catch(handleError);
        }) 
    },

    Mutation: {
        createUser: (parent, {input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            //sempre que formos criar uma mutation, precisamos trabalhar com transações no Sequelize
            return db.sequelize.transaction((t: Transaction) => {
                //callback que recebe o objeto transação
                return db.User
                    .create(input, {
                        transaction: t
                    });
            }).catch(handleError);
        },
        updateUser: compose(...authResolvers)((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            //aqui utilizamos o operador reticências. No EcmaScript6, esse operador é chamado "spread"
            //ele literalmente espalha o conteúdo do array para os parâmetros da função
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found`)
                        return user.update(input, { transaction: t });
                    });
            }).catch(handleError);
        }),
        updateUserPassword: compose(...authResolvers)((parent, {input}, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found`);
                        return user.update(input, { transaction: t })
                            .then((user: UserInstance) => {
                                //verifica se é um valor válido: 
                                // se for, o primeiro ! retornaria false
                                // senão, o primeiro ! retornaria true
                                return !!user;
                            });
                    });
            }).catch(handleError);
        }),
        deleteUser: compose(...authResolvers)((parent, args, {db, authUser}: {db: DbConnection, authUser: AuthUser}, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `User with id ${authUser.id} not found!`);
                        return user.destroy({ transaction: t })
                            .then(user => !!user);
                    });
            }).catch(handleError);
        })
    }
}