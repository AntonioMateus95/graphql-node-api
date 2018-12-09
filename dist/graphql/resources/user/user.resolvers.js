"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils/utils");
//artimanha do EcmaScript 6: desestruturação de objetos
exports.userResolvers = {
    User: {
        posts: (user, { first = 10, offset = 0 }, { db }, info) => {
            //uma instância do sequelize possui um método get para retornar o valor de um atributo do objeto que estamos trabalhando
            return db.Post.findAll({
                where: { author: user.get('id') },
                limit: first,
                offset: offset
            }).catch(utils_1.handleError);
        }
    },
    Query: {
        users: (parent, { limit = 10, offset = 0 }, { db }, info) => {
            //deverá ser feito um select em nosso banco de dados para retornar uma lista paginada de usuários
            return db.User.findAll({
                limit: limit,
                offset: offset
            }).catch(utils_1.handleError);
        },
        user: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.User.findById(id)
                .then((user) => {
                if (!user)
                    throw new Error(`User with id ${id} not found`);
                return user;
            }).catch(utils_1.handleError);
        }
    },
    Mutation: {
        createUser: (parent, { input }, { db }, info) => {
            //sempre que formos criar uma mutation, precisamos trabalhar com transações no Sequelize
            return db.sequelize.transaction((t) => {
                //callback que recebe o objeto transação
                return db.User
                    .create(input, {
                    transaction: t
                });
            }).catch(utils_1.handleError);
        },
        updateUser: (parent, { id, input }, { db }, info) => {
            /* o tipo ID é convertido para String, mas como estamos trabalhando com inteiros,
            podemos fazer a conversão abaixo: */
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`User with id ${id} not found`);
                    return user.update(input, { transaction: t });
                });
            }).catch(utils_1.handleError);
        },
        updateUserPassword: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`User with id ${id} not found`);
                    return user.update(input, { transaction: t })
                        .then((user) => {
                        //verifica se é um valor válido: 
                        // se for, o primeiro ! retornaria false
                        // senão, o primeiro ! retornaria true
                        return !!user;
                    });
                });
            }).catch(utils_1.handleError);
        },
        deleteUser: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`User with id ${id} not found!`);
                    return user.destroy({ transaction: t })
                        .then(user => !!user);
                });
            }).catch(utils_1.handleError);
        }
    }
};
