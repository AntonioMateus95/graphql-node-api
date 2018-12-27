import * as chai from 'chai';
//O chai-http não tem um export no padrão EcmaScript 6, então:
const chaiHttp = require('chai-http');

import app from './../src/app';
//o próprio chai ficará responsável por subir o servidor para testes:
//por isso usamos o app (instância do express) aqui e não o index :)
import db from './../src/models';

chai.use(chaiHttp); //pedir para o chai usar o plugin chaiHttp
const expect = chai.expect;

const handleError = error => {
    //essa situação aqui vai servir quando cometermos um erro de sintaxe
    //com uma query ou mutation do graphQL
    const message: string = (error.response) ? error.response.res.text : error.message || error;
    return Promise.reject(`${error.name}: ${message}`);
};

//agora precisamos exportar o que vamos utilizar fora desse arquivo
export {
    app,
    db,
    chai,
    expect,
    handleError
}