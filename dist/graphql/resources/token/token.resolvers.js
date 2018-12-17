"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const utils_1 = require("../../../utils/utils");
exports.tokenResolvers = {
    Mutation: {
        createToken: (parent, { email, password }, { db }) => {
            return db.User.findOne({
                where: { email: email },
                attributes: ['id', 'password']
            }).then((user) => {
                //se o usuário com o e-mail informado for inválido (não existe em nosso banco de dados)
                //ou se a senha informada é incorreta:
                //retornamos o mesmo erro
                //porque um usuário mal-intencionado, sabendo que somente a senha está incorreta,
                //poderia fazer um ataque para descobrir a senha deste usuário
                let errorMessage = 'Unauthorized, wrong email or password!';
                if (!user || !user.isPassword(user.get('password'), password)) {
                    throw new Error(errorMessage);
                }
                const payload = { sub: user.get('id') };
                return {
                    token: jwt.sign(payload, utils_1.JWT_SECRET)
                };
            });
        }
    }
};
