//responsável por ver quais models existem no nosso projeto
//e por fazer a comunicação com o sequelize, para posteriormente
//criar o banco de dados e as tabelas

import * as fs from 'fs'; //file system
import * as path from 'path';
import * as Sequelize from 'sequelize';

//"module" é uma das variáveis que o Node.js disponibiliza
//dentro do escopo do módulo em que estamos
const basename: string = path.basename(module.filename);
console.log(module.filename);