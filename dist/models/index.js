"use strict";
//responsável por ver quais models existem no nosso projeto
//e por fazer a comunicação com o sequelize, para posteriormente
//criar o banco de dados e as tabelas
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
//"module" é uma das variáveis que o Node.js disponibiliza
//dentro do escopo do módulo em que estamos
const basename = path.basename(module.filename);
console.log(module.filename);
