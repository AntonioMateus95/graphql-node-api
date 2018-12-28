import { db, chai, app, handleError, expect } from './../../test-utils';
import { UserInstance } from '../../../src/models/UserModel';

//describe cria uma suite de testes unitários
describe('User', () => {
    //aqui dentro podemos chamar o método describe outras vezes
    //para poder organizar melhor a forma como os resultados dos 
    //testes serão exibidos dentro do terminal

    let userId: number;

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
        });
    });
});