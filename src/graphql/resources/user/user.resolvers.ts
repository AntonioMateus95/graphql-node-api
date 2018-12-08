import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { parseNamedType } from "graphql/language/parser";
import { Transaction } from "sequelize";
import { UserInstance } from "../../../models/UserModel";
import { handleError } from "../../../utils/utils";

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
        updateUser: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            /* o tipo ID é convertido para String, mas como estamos trabalhando com inteiros,
            podemos fazer a conversão abaixo: */
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance) => {
                        if (!user) throw new Error(`User with id ${id} not found`);
                        return user.update(input, { transaction: t });
                    });
            }).catch(handleError);
        },
        updateUserPassword: (parent, {id, input}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance) => {
                        if (!user) throw new Error(`User with id ${id} not found`);
                        return user.update(input, { transaction: t })
                            .then((user: UserInstance) => {
                                //verifica se é um valor válido: 
                                // se for, o primeiro ! retornaria false
                                // senão, o primeiro ! retornaria true
                                return !!user;
                            });
                    });
            }).catch(handleError);
        },
        deleteUser: (parent, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance) => {
                        if (!user) throw new Error(`User with id ${id} not found!`);
                        return user.destroy({ transaction: t })
                            .then(user => !!user);
                    });
            }).catch(handleError);
        }
    }
}