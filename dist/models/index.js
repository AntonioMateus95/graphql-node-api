"use strict";
//responsável por ver quais models existem no nosso projeto
//e por fazer a comunicação com o sequelize, para posteriormente
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs"); //file system
const path = require("path");
const Sequelize = require("sequelize");
//"module" é uma das variáveis que o Node.js disponibiliza
//dentro do escopo do módulo em que estamos
const basename = path.basename(module.filename);
//ambiente que é passado na chamada do nodemon
const env = process.env.NODE_ENV || 'development';
//o require pega o conteúdo do json cujo caminho foi passado por parâmetro
//e o transforma em um objeto 
let config = require(path.resolve(`${__dirname}./../config/config.json`))[env];
//conexão com o banco de dados
let db = null;
//precisamos garantir que estamos trabalhando com uma única 
//instância do banco de dados
if (!db) {
    db = {};
    const operatorsAliases = false;
    config = Object.assign({ operatorsAliases }, config);
    //já preparamos o sequelize para trabalhar com o banco de dados Mysql
    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    //agora precisamos das models
    fs.readdirSync(__dirname)
        .filter((file) => {
        //apenas arquivos com nome válidos, com extensão .js e diferentes do arquivo index.js em que estamos
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
        .forEach((file) => {
        //para importar um model no sequelize, usamos o método "import"
        const model = sequelize.import(path.join(__dirname, file));
        db[model['name']] = model;
    });
    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });
    //o atributo a seguir vai servir pra sincronizar o sequelize com o MySQL posteriormente
    db['sequelize'] = sequelize;
}
exports.default = db;
