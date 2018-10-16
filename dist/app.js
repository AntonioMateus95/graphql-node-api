"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//o alias abaixo é um nome para o módulo sendo importado
const express = require("express");
class App {
    constructor() {
        this.express = express();
        this.middleware();
    }
    middleware() {
        //o método use serve para todos os tipos de requisição
        this.express.use('/hello', (req, res, next) => {
            res.send({
                hello: 'Hello world!'
            });
        });
    }
}
//exportar uma instãncia da aplicação Express
exports.default = new App().express;
