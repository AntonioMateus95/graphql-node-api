import { db, chai, app, handleError, expect } from './../../test-utils';

//describe cria uma suite de testes unitários
describe('User', () => {
    //aqui dentro podemos chamar o método describe outras vezes
    //para poder organizar melhor a forma como os resultados dos 
    //testes serão exibidos dentro do terminal

    beforeEach(() => {
        //antes de rodar CADA teste (bloco IT) dentro do bloco "User"
        //precisa-se fazer algumas inserções no banco de dados
        return db.Comment.destroy({ where: { } })
            .then((rows: number) => db.Post.destroy({ where: {} }))
            .then((rows: number) => db.User.destroy({ where: {} }))
            .then((rows: number) => {
                return db.User.create({
                    name: 'Peter Quill',
                    email: 'peter@guardians.com',
                    password: '1234'
                });
            })
    })

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
                            expect(userList).to.be.an('array').of.length(1);
                            expect(userList[0]).to.not.have.keys(['id', 'photo', 'createdAt', 'updatedAt', 'posts']);
                            expect(userList[0]).to.have.keys(['name', 'email']);
                        }).catch(handleError)
                })

            })

        });

    })
})