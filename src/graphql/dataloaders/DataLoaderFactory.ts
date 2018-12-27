import * as DataLoader from 'dataloader';

import { DbConnection } from "../../interfaces/DbConnectionInterface";
import { DataLoaders } from "../../interfaces/DataLoadersInterface";
import { UserLoader } from './UserLoader';
import { PostLoader } from './PostLoader';

import { UserInstance } from '../../models/UserModel';
import { PostInstance } from '../../models/PostModel';
import { RequestedFields } from '../ast/RequestedFields';
import { DataLoaderParam } from '../../interfaces/DataLoaderParamInterface';

export class DataLoaderFactory {

    //declarando o construtor da forma a seguir, o compilador já entende
    //que a classe contém um atributo privado chamado db e a ele será 
    //passada uma instância DbConnection por meio do construtor
    constructor(
        private db: DbConnection,
        private requestedFields: RequestedFields
    ) {}

    getLoaders() : DataLoaders {
        //agora o data loader não recebe mais o id do registro diretamente
        //portanto é necessário informar para ele qual é o atributo dentro 
        //do objeto customizado que contém o id
        //como? cacheKeyFn -> senão, ele dará um erro no momento em que ele
        //tentar fazer o cache por requisição
        return {
            userLoader: new DataLoader<DataLoaderParam<number>, UserInstance>(
                (params: DataLoaderParam<number>[]) => UserLoader.batchUsers(this.db.User, params, this.requestedFields),
                { cacheKeyFn: (param: DataLoaderParam<number>) => param.key  }
            ),
            postLoader: new DataLoader<DataLoaderParam<number>, PostInstance>(
                (params: DataLoaderParam<number>[]) => PostLoader.batchPosts(this.db.Post, params, this.requestedFields),
                { cacheKeyFn: (param: DataLoaderParam<number>) => param.key }
            )
        };
    }
}