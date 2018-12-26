"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//o alias abaixo é um nome para o módulo sendo importado
const express = require("express");
const graphqlHTTP = require("express-graphql");
const index_1 = require("./models/index");
const schema_1 = require("./graphql/schema");
const extractjwt_middleware_1 = require("./middlewares/extractjwt.middleware");
const DataLoaderFactory_1 = require("./graphql/dataloaders/DataLoaderFactory");
class App {
    constructor() {
        this.express = express();
        this.init();
    }
    init() {
        this.dataLoaderFactory = new DataLoaderFactory_1.DataLoaderFactory(index_1.default);
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
        //graphqlHTTP: middleware que cria um servidor GraphQL para trabalhar com requisições HTTP
        this.express.use('/graphql', extractjwt_middleware_1.extractJwtMiddleware(), (req, res, next) => {
            //pega a instância do DB Connection e coloca dentro de um atributo da requisição
            //com isso podemos pegar a DB Connection de dentro de todos os resolvers que criarmos
            /* isso será ainda mais necessário quando tivermos a camada de autenticação: o token vem dentro
            da request e se não fizéssemos assim, não seria possível colocar o token dentro do contexto. */
            req['context']['db'] = index_1.default;
            /* O método getLoaders() está sendo chamado aqui porque a cada requisição, precisamos garantir que
            novas instâncias dos data loaders sejam criadas. Lembre-se que o DataLoader faz uma espécie de cache. */
            req['context']['dataLoaders'] = this.dataLoaderFactory.getLoaders();
            next(); //chama o próximo middleware
        }, graphqlHTTP((req) => ({
            schema: schema_1.default,
            graphiql: true,
            context: req['context']
        })));
    }
}
//exportar uma instãncia da aplicação Express
exports.default = new App().express;
