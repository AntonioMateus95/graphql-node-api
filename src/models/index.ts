//responsável por ver quais models existem no nosso projeto
//e por fazer a comunicação com o sequelize, para posteriormente

import * as fs from 'fs'; //file system
import * as path from 'path';
import * as Sequelize from 'sequelize';

import { DbConnection } from '../interfaces/DbConnectionInterface';

//"module" é uma das variáveis que o Node.js disponibiliza
//dentro do escopo do módulo em que estamos
const basename: string = path.basename(module.filename);
//ambiente que é passado na chamada do nodemon
const env: string = process.env.NODE_ENV || 'development';
//o require pega o conteúdo do json cujo caminho foi passado por parâmetro
//e o transforma em um objeto 
let config = require(path.resolve(`${__dirname}./../config/config.json`))[env];
//conexão com o banco de dados
let db = null;

//precisamos garantir que estamos trabalhando com uma única 
//instância do banco de dados
if (!db) {
    db = {};
    
    /* em uma atualização do Sequelize, foi dito que não era seguro trabalhar com 
    operadores. Contudo, para usar os data loaders, um operador é necessário. Sendo
    assim, passaremos um objeto ao invés de false */
    //const operatorsAliases = false;
    const operatorsAliases = {
        $in: Sequelize.Op.in // semelhante ao in do MySQL: select passando uma lista de ids que queremos buscar
    };

    config = Object.assign({operatorsAliases}, config);

    //já preparamos o sequelize para trabalhar com o banco de dados Mysql
    const sequelize: Sequelize.Sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );

    //agora precisamos das models
    fs.readdirSync(__dirname)
        .filter((file: string) => {
            const fileSlice: string = file.slice(-3);
            //apenas arquivos com nome válidos, com extensão .js e diferentes do arquivo index.js em que estamos
            return (file.indexOf('.') !== 0) && (file !== basename) && ((fileSlice === '.js') || (fileSlice === '.ts'));
        })
        .forEach((file: string) => {
            //para importar um model no sequelize, usamos o método "import"
            const model = sequelize.import(path.join(__dirname, file));
            db[model['name']] = model;
        });

    Object.keys(db).forEach((modelName: string) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    //o atributo a seguir vai servir pra sincronizar o sequelize com o MySQL posteriormente
    db['sequelize'] = sequelize; 
}

export default <DbConnection>db;
