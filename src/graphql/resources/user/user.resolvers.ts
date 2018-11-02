import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionInterface";
import { parseNamedType } from "graphql/language/parser";
import { UserInstance } from "../../../models/UserModel";

//artimanha do EcmaScript 6: desestruturação de objetos
export const userResolvers = {
    Query: {
        users: (parent, { limit = 10, offset = 0 }, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            //deverá ser feito um select em nosso banco de dados para retornar uma lista paginada de usuários
            return db.User.findAll({
                limit: limit,
                offset: offset
            });
        },
        user: (parent, {id}, {db}: {db: DbConnection}, info: GraphQLResolveInfo) => {
            return db.User.findById(id)
            .then((user: UserInstance) => {
                if (!user) throw new Error(`User with id ${id} not found`);
                return user;
            });
        }
    }
}