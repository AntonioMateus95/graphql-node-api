import * as Sequelize from 'sequelize';
import { BaseModelInterface } from '../interfaces/BaseModelInterface';
import { ModelsInterface } from '../interfaces/ModelsInterface';

export interface PostAttributes {
    id?: number;
    title?: string;
    content?: string;
    photo?: string;
    author?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PostInstance extends Sequelize.Instance<PostAttributes> {}

export interface PostModel extends BaseModelInterface, Sequelize.Model<PostInstance, PostAttributes> {}

export default (sequelize: Sequelize.Sequelize, dataTypes: Sequelize.DataTypes): PostModel => {
    const Post: PostModel = sequelize.define('Post', {
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

    Post.associate = (models: ModelsInterface): void => {
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
    }

    return Post;
}