"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserLoader {
    //método para recuperar usuários em lote
    //primeiro parâmetro: model do sequelize que contém os métodos de busca
    //segundo parâmetro: array com os ids que queremos buscar no banco
    static batchUsers(User, ids) {
        return Promise.resolve(User.findAll({
            where: { id: { $in: ids } }
        }));
    }
}
exports.UserLoader = UserLoader;
