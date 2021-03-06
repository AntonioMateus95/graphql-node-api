import * as jwt from 'jsonwebtoken';

import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { UserInstance } from "../../../models/UserModel";
import { JWT_SECRET } from '../../../utils/utils';

export const tokenResolvers = {
    Mutation: {
        createToken: (parent, { email, password }, {db}: {db: DbConnection}) => {
            return db.User.findOne({
                where: {email: email},
                attributes: ['id', 'password']
            }).then((user: UserInstance) => {
                //se o usuário com o e-mail informado for inválido (não existe em nosso banco de dados)
                //ou se a senha informada é incorreta:
                //retornamos o mesmo erro
                //porque um usuário mal-intencionado, sabendo que somente a senha está incorreta,
                //poderia fazer um ataque para descobrir a senha deste usuário

                let errorMessage: string = 'Unauthorized, wrong email or password!';
                if (!user || !user.isPassword(user.get('password'), password)) {
                    throw new Error(errorMessage);
                }
                
                const payload = { sub: user.get('id') };
                return {
                    token: jwt.sign(payload, JWT_SECRET)
                };
            });
        }
    }
}