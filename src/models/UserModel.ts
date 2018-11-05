import * as Sequelize from 'sequelize';
import { BaseModelInterface } from '../interfaces/BaseModelInterface';
import { userInfo } from 'os';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { ModelsInterface } from '../interfaces/ModelsInterface';

/* Aqui serão exportadas três interfaces:
UserAttributes: contém os atributos do model Usuário que poderão ser usados quando tivermos uma instância do usuário
UserInstance: serve quando estivermos trabalhando com um registro de usuário retornado do banco de daods. 
UserModel
e uma função que será usada pelo import do sequelize para criar a tabela no banco de dados 
Também é possível inserir novos registros também através de um nova instância do model*/

//todos os campos serão opcionais
//os campos createdAt e updatedAt são criados e atualizados automaticamente pelo sequelize
export interface UserAttributes {
    id?: number;
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
    createdAt?: string;
    updatedAt?: string;
}

/* a interface UserInstance herda de duas interfaces:
Instance<UserAttributes>: para poder usar os métodos de instância -> save, update, etc.
UserAttributes: para poder acessar os atributos diretamente pela instância */
export interface UserInstance extends Sequelize.Instance<UserAttributes>, UserAttributes {
    //método que valida o password informado quando no login
    isPassword(encodedPassword: string, password: string): boolean;
}

/* contém os métodos do model em si: 
* associação entre tabelas
* cadastrar novo usuário
* encontrar pelo id
* atualizar usuário existente

o UserModel precisa herdar do tipo de instância do Usuário e da interface que contém seus atributos
*/
export interface UserModel extends BaseModelInterface, Sequelize.Model<UserInstance, UserAttributes> { }

//sequelize: instância do sequelize aberta para o banco de dados
//dataTypes: os tipos de dados que podemos usar para definir os atributos do nosso model
export default (sequelize: Sequelize.Sequelize, dataTypes: Sequelize.DataTypes): UserModel => {
    //define a tabela de usuários no banco de dados
    //nome da tabela; atributos da tabela
    /* No caso da foto, a configuração usando BLOB significa que a foto será convertida em Base 64
    antes de salvar */
    /* O nome da tabela por padrão é o nome colocado no método define, passado para o plural. Contudo, é possível
    atribuir um outro nome se desejado */
    /* Além disso existem hooks, equivalentes a triggers/gatilhos no banco de dados. No sequelize eles são conhecidos 
    como life-cycle events. Com eles, é possível eespecificar eventos como beforeCreate e beforeUpdate. */
    const User: UserModel = 
        sequelize.define('User', {
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
                beforeCreate: (user: UserInstance, options: Sequelize.CreateOptions): void => {
                    //nesse momento, nós iremos criptografar a senha antes de salvá-la no banco de dados
                    //para isso será mecessário instalar um outro pacote do NPM: bcript
                    const salt = genSaltSync();
                    user.password = hashSync(user.password, salt);
                },
                beforeUpdate: (user: UserInstance, options: Sequelize.CreateOptions): void => {
                    /* Precisamos também de uma forma de verificar quando a senha foi alterada 
                    pois o código abaixo só deve ser aplicado quando APENAS a mutation de alterar 
                    senha for chamada: */
                    //se o campo password estiver sendo alterado:
                    if (user.changed('password')) {
                        const salt = genSaltSync();
                        user.password = hashSync(user.password, salt);
                    }
                }
            }
        });

        User.associate = (models: ModelsInterface): void => {
            //como o model User não está associado a outros models, esse método é desnecessário
        }

        User.prototype.isPassword = (encodedPassword: string, password: string): boolean => {
            return compareSync(password, encodedPassword);
        }

    return User;
}