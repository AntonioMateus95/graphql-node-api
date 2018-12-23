import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";
import { UserInstance } from "../../../models/UserModel";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/auth.resolver";

//artimanha do EcmaScript 6: desestruturação de objetos
export const userResolvers = {
    User: {
        posts: (user: UserInstance, { first = 10, offset = 0 }, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            //uma instância do sequelize possui um método get para retornar o valor de um atributo do objeto que estamos trabalhando
            return db.Post.findAll({
                where: { author: user.get('id') },
                limit: first,
                offset: offset
            }).catch(handleError);
        }
    },
    Query: {
        users: (parent, { limit = 10, offset = 0 }, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            //deverá ser feito um select em nosso banco de dados para retornar uma lista paginada de usuários
            return db.User.findAll({
                limit: limit,
                offset: offset
            }).catch(handleError);
        },
        user: (parent, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.User.findById(id)
            .then((user: UserInstance) => {
                if (!user) throw new Error(`User with id ${id} not found`);
                return user;
            }).catch(handleError);
        }
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