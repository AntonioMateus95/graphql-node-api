"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (sequelize, dataTypes) => {
    const Post = sequelize.define('Post', {
        id: {
            type: dataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: dataTypes.STRING,
            allowNull: false
        },
        content: {
            type: dataTypes.TEXT,
            allowNull: false
        },
        photo: {
            type: dataTypes.BLOB({
                length: 'long'
            }),
            allowNull: false
        }
    }, {
        tableName: 'posts'
    });
    Post.associate = (models) => {
        /* Como um user pode ter vários posts, mas um post pertence a um único usuário,
        nós utilizamos o método belongsTo. O primeiro parâmetro recebe o model a qual o post pertence;
        e o segundo recebe algumas configurações de foreignKey. Dentro do objeto de configurações da
        foreinKey, nós passamos o nome da foreignKey, o campo que contém a foreignKey e se o campo
        permite valor nulo ou não. */
        Post.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                field: 'author',
                name: 'author'
            }
        });
    };
    return Post;
};
