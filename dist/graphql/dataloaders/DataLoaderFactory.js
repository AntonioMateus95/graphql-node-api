"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataLoader = require("dataloader");
const UserLoader_1 = require("./UserLoader");
const PostLoader_1 = require("./PostLoader");
class DataLoaderFactory {
    //declarando o construtor da forma a seguir, o compilador já entende
    //que a classe contém um atributo privado chamado db e a ele será 
    //passada uma instância DbConnection por meio do construtor
    constructor(db, requestedFields) {
        this.db = db;
        this.requestedFields = requestedFields;
    }
    getLoaders() {
        //agora o data loader não recebe mais o id do registro diretamente
        //portanto é necessário informar para ele qual é o atributo dentro 
        //do objeto customizado que contém o id
        //como? cacheKeyFn -> senão, ele dará um erro no momento em que ele
        //tentar fazer o cache por requisição
        return {
            userLoader: new DataLoader((params) => UserLoader_1.UserLoader.batchUsers(this.db.User, params, this.requestedFields), { cacheKeyFn: (param) => param.key }),
            postLoader: new DataLoader((params) => PostLoader_1.PostLoader.batchPosts(this.db.Post, params, this.requestedFields), { cacheKeyFn: (param) => param.key })
        };
    }
}
exports.DataLoaderFactory = DataLoaderFactory;
