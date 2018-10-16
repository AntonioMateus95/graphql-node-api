//o alias abaixo é um nome para o módulo sendo importado
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import schema from './graphql/schema';

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.middleware();
    }

    private middleware() : void {
        //o método use serve para todos os tipos de requisição
        // this.express.use('/hello', (req: express.Request, res: express.Response, next: express.NextFunction) => {
        //     res.send({
        //         hello: 'Hello world!'
        //     })
        // })
        //a variável NODE_ENV abaixo deve ser setada no package.json no script que chama o nodemon
        //se estivermos no windows, a variável deverá ser setada usando o comando set NODE_ENV = development
        this.express.use('/graphql', graphqlHTTP({
            schema: schema,
            graphiql: process.env.NODE_ENV === 'development'
        }));
    }
}

//exportar uma instãncia da aplicação Express
export default new App().express;