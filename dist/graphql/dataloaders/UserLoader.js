"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserLoader {
    //método para recuperar usuários em lote
    //primeiro parâmetro: model do sequelize que contém os métodos de busca
    //segundo parâmetro: array com os pares id, info que vem do resolver
    //terceiro parâmetro: instância do requestedFields criada no início da aplicação
    static batchUsers(User, params, requestedFields) {
        let ids = params.map(param => param.key);
        return Promise.resolve(User.findAll({
            where: { id: { $in: ids } },
            attributes: requestedFields.getFields(params[0].info, { keep: ['id'], exclude: ['posts'] })
        }));
    }
}
exports.UserLoader = UserLoader;
