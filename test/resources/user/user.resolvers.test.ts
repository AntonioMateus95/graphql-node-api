import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../src/utils/utils';

import { db, chai, app, handleError, expect } from './../../test-utils';
import { UserInstance } from '../../../src/models/UserModel';

//describe cria uma suite de testes unitários
describe('User', () => {
    //aqui dentro podemos chamar o método describe outras vezes
    //para poder organizar melhor a forma como os resultados dos 
    //testes serão exibidos dentro do terminal

    let userId: number;
    let userToken: string;

    beforeEach(() => {
        //antes de rodar CADA teste (bloco IT) dentro do bloco "User"
        //precisa-se fazer algumas inserções no banco de dados
        return db.Comment.destroy({ where: { } })
            .then((rows: number) => db.Post.destroy({ where: {} }))
            .then((rows: number) => db.User.destroy({ where: {} }))
            .then((rows: number) => db.User.bulkCreate([
                {
                    name: 'Peter Quill',
                    email: 'peter@guardians.com',
                    password: '1234'
                }, 
                {
                    name: 'Gamora',
                    email: 'gamora@guardians.com',
                    password: '1234'
                },
                {
                    name: 'Groot',
                    email: 'groot@guardians.com',
                    password: 'iamgroot'
                }
            ])).then((users: UserInstance[]) => {
                userId = users[0].get('id');

                const payload = { sub: userId };
                userToken = jwt.sign(payload, JWT_SECRET);
            })
    });

    describe('Queries', () => {        
        describe('application/json', () => {
            describe('users', () => {
                //aqui sim criamos o nosso primeiro teste:
                it('should return a list of users', () => {
                    //corpo da requisição http com tipo "application/json"
                    let body = {
                        query: `
                            query {
                                users {
                                    name
                                    email
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql') //no verbo http colocamos a rota para que estamos fazendo a requisição
                        .set('content-type', 'application/json') //headers
                        .send(JSON.stringify(body)) //corpo da requisição
                        .then((res: ChaiHttp.Response) => {
                            //aqui dentro fazemos as assertions (verificações)
                            const userList = res.body.data.users; //users, nesse caso, é o nome da query
                            expect(res.body.data).to.be.an('object');
                            expect(userList).to.be.an('array');
                            expect(userList[0]).to.not.have.keys(['id', 'photo', 'createdAt', 'updatedAt', 'posts']);
                            expect(userList[0]).to.have.keys(['name', 'email']);
                        }).catch(handleError)
                });

                it('should paginate a list of users', () => {
                    //corpo da requisição http com tipo "application/json"
                    let body = {
                        query: `
                            query getUsersList($first: Int, $offset: Int) {
                                users(limit: $first, offset: $offset) {
                                    name
                                    email,
                                    createdAt
                                }
                            }
                        `,
                        variables: {
                            first: 2,
                            offset: 1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql') //no verbo http colocamos a rota para que estamos fazendo a requisição
                        .set('content-type', 'application/json') //headers
                        .send(JSON.stringify(body)) //corpo da requisição
                        .then((res: ChaiHttp.Response) => {
                            //aqui dentro fazemos as assertions (verificações)
                            const userList = res.body.data.users; //users, nesse caso, é o nome da query
                            expect(res.body.data).to.be.an('object');
                            expect(userList).to.be.an('array').of.length(2);
                            expect(userList[0]).to.not.have.keys(['id', 'photo', 'updatedAt', 'posts']);
                            expect(userList[0]).to.have.keys(['name', 'email', 'createdAt']);
                        }).catch(handleError)
                });
            });

            describe('user', () => {
                it('should return a single user', () => {
                    //corpo da requisição http com tipo "application/json"
                    let body = {
                        query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    id
                                    name
                                    email
                                    posts {
                                        title
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql') //no verbo http colocamos a rota para que estamos fazendo a requisição
                        .set('content-type', 'application/json') //headers
                        .send(JSON.stringify(body)) //corpo da requisição
                        .then((res: ChaiHttp.Response) => {
                            const singleUser = res.body.data.user; 
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.keys(['id', 'name', 'email', 'posts']);
                            expect(singleUser.name).to.equal('Peter Quill');    
                            expect(singleUser.email).to.equal('peter@guardians.com');    
                        }).catch(handleError)
                });

                it('should return \'name\' attribute', () => {
                    let body = {
                        query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                }
                            }
                        `,
                        variables: {
                            id: userId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            const singleUser = res.body.data.user; 
                            expect(res.body.data).to.be.an('object');
                            expect(singleUser).to.be.an('object');
                            expect(singleUser).to.have.key('name');
                            expect(singleUser.name).to.equal('Peter Quill');    
                            expect(singleUser.email).to.be.undefined;    
                            expect(singleUser.createdAt).to.be.undefined;    
                            expect(singleUser.posts).to.be.undefined;    
                        }).catch(handleError)
                });

                it('should return an error if User not exists', () => {
                    let body = {
                        query: `
                            query getSingleUser($id: ID!) {
                                user(id: $id) {
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            id: -1
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            expect(res.body.data.user).to.be.null;
                            expect(res.body.errors).to.be.an('array');
                            expect(res.body).to.have.keys(['data', 'errors']);
                            expect(res.body.errors[0].message).to.equal('Error: User with id -1 not found');
                        }).catch(handleError)
                });
            });

            describe('currentUser', () => {
                it('should return the User owner of the token', () => {
                    let body = {
                        query: `
                            query  {
                                currentUser  {
                                    name
                                    email
                                }
                            }
                        `,
                    };

                    return chai.request(app)
                        .post('/graphql') 
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            const currentUser = res.body.data.currentUser; 
                            expect(res.body.data).to.be.an('object');
                            expect(currentUser).to.be.an('object');
                            expect(currentUser).to.have.keys(['name', 'email']);
                            expect(currentUser.name).to.equal('Peter Quill');    
                            expect(currentUser.email).to.equal('peter@guardians.com');    
                        }).catch(handleError)
                });
            });
        });
    });

    describe('Mutations', () => {
        describe('application/json', () => {
            describe('createUser', () => {
                //ainda não precisa de autenticação
                it('should create new user', () => {
                    let body = {
                        query: `
                            mutation createNewUser($input: UserCreateInput!) {
                                createUser(input: $input) {
                                    id
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Drax',
                                email: 'drax@guardians.com',
                                password: '1234'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            const createdUser = res.body.data.createUser;
                            expect(createdUser).to.be.an('object');
                            expect(createdUser.name).to.equal('Drax');
                            expect(createdUser.email).to.equal('drax@guardians.com');
                            expect(Number(createdUser.id)).to.be.a('number');
                        }).catch(handleError);
                });

                it('there should be one more user in the database', () => {
                    let createBody = {
                        query: `
                            mutation createNewUser($input: UserCreateInput!) {
                                createUser(input: $input) {
                                    id
                                    name
                                    email
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Drax',
                                email: 'drax@guardians.com',
                                password: '1234'
                            }
                        }
                    };

                    let listBody = {
                        query: `
                            query listAfterCreate {
                                users {
                                    name
                                    email
                                }
                            }
                        `,
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(createBody))
                        .then(res => {
                            chai.request(app)
                                .post('/graphql')
                                .set('content-type', 'application/json')
                                .send(JSON.stringify(listBody))
                                .then(res => {
                                    const userList = res.body.data.users;
                                    expect(res.body.data).to.be.an('object');
                                    expect(userList).to.be.an('array').of.length(4);
                                });
                        }).catch(handleError);
                });
            });

            describe('updateUser', () => {
                it('should update an existing User', () => {
                    let body = {
                        query: `
                            mutation updateExistingUser($input: UserUpdateInput!) {
                                updateUser(input: $input) {
                                    name
                                    email
                                    photo
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Star Lord',
                                email: 'peter@guardians.com',
                                photo: 'some_photo_base_64'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            const updatedUser = res.body.data.updateUser;
                            expect(updatedUser).to.be.an('object');
                            expect(updatedUser.name).to.equal('Star Lord');
                            expect(updatedUser.email).to.equal('peter@guardians.com');
                            expect(updatedUser.photo).to.not.be.null;
                            expect(updatedUser.id).to.be.undefined;
                        }).catch(handleError);
                });

                it('should block operation if token is invalid', () => {
                    let body = {
                        query: `
                            mutation updateExistingUser($input: UserUpdateInput!) {
                                updateUser(input: $input) {
                                    name
                                    email
                                    photo
                                }
                            }
                        `,
                        variables: {
                            input: {
                                name: 'Star Lord',
                                email: 'peter@guardians.com',
                                photo: 'some_photo_base_64'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer INVALID_TOKEN`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data.updateUser).to.be.null;
                            expect(res.body).to.have.keys(['data', 'errors']);
                            expect(res.body.errors).to.be.an('array');
                            expect(res.body.errors[0].message).to.equal('JsonWebTokenError: jwt malformed');
                        }).catch(handleError);
                });
            });

            describe('updateUserPassword', () => {
                it('should update the password of an existing User', () => {
                    let body = {
                        query: `
                            mutation updateUserPassword($input: UserUpdatePasswordInput!) {
                                updateUserPassword(input: $input)
                            }
                        `,
                        variables: {
                            input: {
                                password: 'peter123'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data.updateUserPassword).to.be.true;
                        }).catch(handleError);
                });
            })

            describe('deleteUser', () => {
                it('should delete an existing User', () => {
                    let body = {
                        query: `
                            mutation {
                                deleteUser
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.data.deleteUser).to.be.true;
                        }).catch(handleError);
                });

                it('should block operation if token is not provided', () => {
                    let body = {
                        query: `
                            mutation {
                                deleteUser
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then(res => {
                            expect(res.body.errors[0].message).to.equal('Unauthorized: Token not provided!');
                        }).catch(handleError);
                });
            })
        });
    });
});