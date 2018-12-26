"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataLoader = require("dataloader");
const UserLoader_1 = require("./UserLoader");
const PostLoader_1 = require("./PostLoader");
class DataLoaderFactory {
    //declarando o construtor da forma a seguir, o compilador já entende
    //que a classe contém um atributo privado chamado db e a ele será 
    //passada uma instância DbConnection por meio do construtor
    constructor(db) {
        this.db = db;
    }
    getLoaders() {
        return {
            userLoader: new DataLoader((ids) => UserLoader_1.UserLoader.batchUsers(this.db.User, ids)),
            postLoader: new DataLoader((ids) => PostLoader_1.PostLoader.batchPosts(this.db.Post, ids))
        };
    }
}
exports.DataLoaderFactory = DataLoaderFactory;
