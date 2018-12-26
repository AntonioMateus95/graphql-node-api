import * as DataLoader from 'dataloader';

import { UserInstance } from '../models/UserModel';
import { PostInstance } from '../models/PostModel';

export interface DataLoaders {

    //DataLoader é um tipo genérico que recebe dois parâmetros:
    // - o tipo do identificador (number, Guid, ...)
    // - o tipo correspondente à instância do sequelize que será carregada
    userLoader: DataLoader<number, UserInstance>;
    postLoader: DataLoader<number, PostInstance>;

}