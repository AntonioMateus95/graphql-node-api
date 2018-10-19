"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = require("bcryptjs");
//sequelize: instância do sequelize aberta para o banco de dados
//dataTypes: os tipos de dados que podemos usar para definir os atributos do nosso model
exports.default = (sequelize, dataTypes) => {
    //define a tabela de usuários no banco de dados
    //nome da tabela; atributos da tabela
    /* No caso da foto, a configuração usando BLOB significa que a foto será convertida em Base 64
    antes de salvar */
    /* O nome da tabela por padrão é o nome colocado no método define, passado para o plural. Contudo, é possível
    atribuir um outro nome se desejado */
    /* Além disso existem hooks, equivalentes a triggers/gatilhos no banco de dados. No sequelize eles são conhecidos
    como life-cycle events. Com eles, é possível eespecificar eventos como beforeCreate e beforeUpdate. */
    const User = sequelize.define('User', {
        id: {
            type: dataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: dataTypes.STRING(128),
            allowNull: false
        },
        email: {
            type: dataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        password: {
            type: dataTypes.STRING(128),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        photo: {
            type: dataTypes.BLOB({
                length: 'long'
            }),
            allowNull: true,
            defaultValue: null
        },
    }, {
        tableName: 'users',
        hooks: {
            beforeCreate: (user, options) => {
                //nesse momento, nós iremos criptografar a senha antes de salvá-la no banco de dados
                //para isso será mecessário instalar um outro pacote do NPM: bcript
                const salt = bcryptjs_1.genSaltSync();
                user.password = bcryptjs_1.hashSync(user.password, salt);
            }
        }
    });
    User.associate = (models) => {
        //como o model User não está associado a outros models, esse método é desnecessário
    };
    User.prototype.isPassword = (encodedPassword, password) => {
        return bcryptjs_1.compareSync(password, encodedPassword);
    };
    return User;
};
