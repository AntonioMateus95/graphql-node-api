import * as DataLoader from 'dataloader';

import { DbConnection } from "../../interfaces/DbConnectionInterface";
import { DataLoaders } from "../../interfaces/DataLoadersInterface";
import { UserLoader } from './UserLoader';
import { PostLoader } from './PostLoader';

import { UserInstance } from '../../models/UserModel';
import { PostInstance } from '../../models/PostModel';

export class DataLoaderFactory {

    //declarando o construtor da forma a seguir, o compilador já entende
    //que a classe contém um atributo privado chamado db e a ele será 
    //passada uma instância DbConnection por meio do construtor
    constructor(
        private db: DbConnection
    ) {}

    getLoaders() : DataLoaders {
        return {
            userLoader: new DataLoader<number, UserInstance>(
                (ids: number[]) => UserLoader.batchUsers(this.db.User, ids)
            ),
            postLoader: new DataLoader<number, PostInstance>(
                (ids: number[]) => PostLoader.batchPosts(this.db.Post, ids)
            )
        };
    }
}