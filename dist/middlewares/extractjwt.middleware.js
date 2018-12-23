"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const models_1 = require("./../models");
const utils_1 = require("../utils/utils");
exports.extractJwtMiddleware = () => {
    //request middlewares também são funções
    return (req, res, next) => {
        //no lugar da função que está sendo implementada, podemos usar o passport
        //passport já faz toda essa integração com o JWT, mas seria preciso adicionar 
        //mais uma dependência ao nosso projeto
        let authorization = req.get('authorization'); //Authorization = Bearer sgsggsgsgdgag
        let token = authorization ? authorization.split(' ')[1] : undefined;
        //nesse ponto, extraimos o token do cabeçalho da requisição
        req['context'] = {};
        req['context']['authorization'] = authorization;
        //se o token estiver vindo na requisição,
        //devemos verificá-lo
        if (!token) {
            return next();
        }
        //..validá-lo
        //o método verify() valida o token passado por parâmetro e também 
        //retorna o payload criptografado nesse token
        jwt.verify(token, utils_1.JWT_SECRET, (error, payload) => {
            //se houver algum erro durante a validação do token
            if (error) {
                return next();
            }
            models_1.default.User.findById(payload.sub, {
                attributes: ['id', 'email']
            }).then((user) => {
                //se o usuário pôde ser encontrado usando o sub do payload
                //do token recebido
                if (user) {
                    req['context']['user'] = {
                        id: user.get('id'),
                        email: user.get('email')
                    };
                }
                return next();
            });
        });
    };
};
