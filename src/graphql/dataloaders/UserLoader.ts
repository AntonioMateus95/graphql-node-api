import { UserModel, UserInstance } from "../../models/UserModel";

export class UserLoader {

    //método para recuperar usuários em lote
    //primeiro parâmetro: model do sequelize que contém os métodos de busca
    //segundo parâmetro: array com os ids que queremos buscar no banco
    static batchUsers(User: UserModel, ids: number[]) : Promise<UserInstance[]> {
        return Promise.resolve(
            User.findAll({
                where: { id: { $in: ids } }
            })
        );
    }

}