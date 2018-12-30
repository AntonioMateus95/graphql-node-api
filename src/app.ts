//o alias abaixo é um nome para o módulo sendo importado
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';

import db from './models/index';
import schema from './graphql/schema';
import { extractJwtMiddleware } from './middlewares/extractjwt.middleware';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';
import { RequestedFields } from './graphql/ast/RequestedFields';
import * as cors from 'cors';
import * as compression from 'compression';

class App {
    public express: express.Application;
    private dataLoaderFactory: DataLoaderFactory;
    private requestedFields: RequestedFields;

    constructor() {
        this.express = express();
        this.init();
    }

    private init(): void {
        this.requestedFields = new RequestedFields();
        this.dataLoaderFactory = new DataLoaderFactory(db, this.requestedFields);
        this.middleware();
    }

    private middleware() : void {
        //os métodos cors() e compression() retornam um RequestHandler
        this.express.use(cors({
            origin: '*', //qualquer domínio consegue acessar a nossa API
            methods: ['GET', 'POST'], //já que estamos trabalhando com uma api GraphQL
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Encoding'], //a API aceitará requisições compactadas
            preflightContinue: false,
            optionsSuccessStatus: 204
        }));

        this.express.use(compression());

        //o método use serve para todos os tipos de requisição
        // this.express.use('/hello', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        //     res.send({
        //         hello: 'Hello world!'
        //     })
        // })
        //a variável NODE_ENV abaixo deve ser setada no package.json no script que chama o nodemon
        //se estivermos no windows, a variável deverá ser setada usando o comando set NODE_ENV = development
        //graphqlHTTP: middleware que cria um servidor GraphQL para trabalhar com requisições HTTP
        this.express.use('/graphql', 
            
            extractJwtMiddleware(),
            
            (req, res, next) => {
                //pega a instância do DB Connection e coloca dentro de um atributo da requisição
                //com isso podemos pegar a DB Connection de dentro de todos os resolvers que criarmos
                /* isso será ainda mais necessário quando tivermos a camada de autenticação: o token vem dentro 
                da request e se não fizéssemos assim, não seria possível colocar o token dentro do contexto. */
                req['context']['db'] = db;
                /* O método getLoaders() está sendo chamado aqui porque a cada requisição, precisamos garantir que
                novas instâncias dos data loaders sejam criadas. Lembre-se que o DataLoader faz uma espécie de cache. */
                req['context']['dataLoaders'] = this.dataLoaderFactory.getLoaders();
                req['context']['requestedFields'] = this.requestedFields;
                next(); //chama o próximo middleware
            },
        
            graphqlHTTP((req) => ({
                schema: schema,
                graphiql: true,
                context: req['context']
            }))
        );
    }
}

//exportar uma instãncia da aplicação Express
export default new App().express;