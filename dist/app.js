"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//o alias abaixo é um nome para o módulo sendo importado
const express = require("express");
const graphqlHTTP = require("express-graphql");
const schema_1 = require("./graphql/schema");
class App {
    constructor() {
        this.express = express();
        this.middleware();
    }
    middleware() {
        //o método use serve para todos os tipos de requisição
        // this.express.use('/hello', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        //     res.send({
        //         hello: 'Hello world!'
        //     })
        // })
        //a variável NODE_ENV abaixo deve ser setada no package.json no script que chama o nodemon
        //se estivermos no windows, a variável deverá ser setada usando o comando set NODE_ENV = development
        this.express.use('/graphql', graphqlHTTP({
            schema: schema_1.default,
            graphiql: process.env.NODE_ENV === 'development'
        }));
    }
}
//exportar uma instãncia da aplicação Express
exports.default = new App().express;
