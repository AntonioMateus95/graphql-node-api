//o alias abaixo é um nome para o módulo sendo importado
import * as express from 'express';

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.middleware();
    }

    private middleware() : void {
        //o método use serve para todos os tipos de requisição
        this.express.use('/hello', (req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.send({
                hello: 'Hello world!'
            })
        })
    }
}

//exportar uma instãncia da aplicação Express
export default new App().express;