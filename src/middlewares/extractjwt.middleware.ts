import * as 
jwt from 'jsonwebtoken';
import db from './../models';
import { RequestHandler, Request, Response, NextFunction } from "express";
import { JWT_SECRET } from '../utils/utils';
import { UserInstance } from '../models/UserModel';

export const extractJwtMiddleware = (): RequestHandler => {
    //request middlewares também são funções
    return (req: Request, res: Response, next: NextFunction): void => {
        //no lugar da função que está sendo implementada, podemos usar o passport
        //passport já faz toda essa integração com o JWT, mas seria preciso adicionar 
        //mais uma dependência ao nosso projeto
        let authorization: string = req.get('authorization'); //Authorization = Bearer sgsggsgsgdgag
        let token: string = authorization ? authorization.split(' ')[1] : undefined;

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
        jwt.verify(token, JWT_SECRET, (error, payload: any) => {
            //se houver algum erro durante a validação do token
            if (error) {
                return next();
            }

            db.User.findById(payload.sub, {
                attributes: ['id', 'email']
            }).then((user: UserInstance) => {
                //se o usuário pôde ser encontrado usando o sub do payload
                //do token recebido
                if (user) {
                    req['context']['authUser'] = {
                        id: user.get('id'),
                        email: user.get('email')
                    };
                }

                return next();
            });
        });
    };
};