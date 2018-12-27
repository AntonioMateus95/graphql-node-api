import * as DataLoader from 'dataloader';

import { UserInstance } from '../models/UserModel';
import { PostInstance } from '../models/PostModel';
import { DataLoaderParam } from './DataLoaderParamInterface';

export interface DataLoaders {

    //DataLoader é um tipo genérico que recebe dois parâmetros:
    // - o tipo do identificador (number, Guid, ...)
    // - o tipo correspondente à instância do sequelize que será carregada
    userLoader: DataLoader<DataLoaderParam<number>, UserInstance>;
    postLoader: DataLoader<DataLoaderParam<number>, PostInstance>;

}