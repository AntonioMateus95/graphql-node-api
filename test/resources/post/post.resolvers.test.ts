import * as jwt from 'jsonwebtoken';

import { app, chai, db, expect, handleError } from "../../test-utils";
import { JWT_SECRET } from "../../../src/utils/utils";
import { UserInstance } from "../../../src/models/UserModel";

import { PIKACHU_MEME } from '../../images/pikachu-meme';
import { PostInstance } from '../../../src/models/PostModel';

describe('Post', () => {
    let userId: number;
    let userToken: string;
    let postId: number;

    beforeEach(() => {
        //antes de rodar CADA teste (bloco IT) dentro do bloco "User"
        //precisa-se fazer algumas inserções no banco de dados
        return db.Comment.destroy({ where: { } })
            .then((rows: number) => db.Post.destroy({ where: {} }))
            .then((rows: number) => db.User.destroy({ where: {} }))
            .then((rows: number) => db.User.create(
                {
                    name: 'Rocket',
                    email: 'rocket@guardians.com',
                    password: '1234'
                }
            )).then((user: UserInstance) => {
                userId = user.get('id');
                const payload = { sub: userId };
                userToken = jwt.sign(payload, JWT_SECRET);
            
                return db.Post.bulkCreate([
                    {
                        title: 'First post',
                        content: 'First post',
                        author: userId,
                        photo: PIKACHU_MEME
                    },
                    {
                        title: 'Second post',
                        content: 'Second post',
                        author: userId,
                        photo: PIKACHU_MEME
                    },
                    {
                        title: 'Third post',
                        content: 'Third post',
                        author: userId,
                        photo: PIKACHU_MEME
                    }
                ]).then((posts: PostInstance[]) => {
                    postId = posts[0].get('id');
                });
            })
    });

    describe('Queries', () => {
        describe('application/json', () => {
            describe('posts', () => {
                it('should return a list of posts', () => {
                    let body = {
                        query: `
                            query {
                                posts {
                                    title
                                    content
                                    photo
                                }
                            }
                        `
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            const postList = res.body.data.posts; 
                            expect(res.body.data).to.be.an('object');
                            expect(postList).to.be.an('array');
                            expect(postList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments']);
                            expect(postList[0]).to.have.keys(['title', 'content', 'photo']);
                            expect(postList[0].title).to.equal('First post');
                        }).catch(handleError)
                });
            });

            describe('post', () => {
                it('should return a single post with its author', () => {
                    let body = {
                        query: `
                            query getPost($id: ID!) {
                                post(id: $id) {
                                    title
                                    author {
                                        name
                                        email
                                    }
                                    comments {
                                        comment
                                    }
                                }
                            }
                        `,
                        variables: {
                            id: postId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            const singlePost = res.body.data.post;
                            expect(res.body.data).to.have.key('post');
                            expect(singlePost).to.be.an('object');
                            expect(singlePost).to.have.keys(['title', 'author', 'comments']);
                            expect(singlePost.title).to.equal('First post');
                            expect(singlePost.author).to.be.an('object').with.keys(['name', 'email']);
                            expect(singlePost.author).to.be.an('object').with.not.keys(['id', 'createdAt', 'updatedAt', 'posts']);
                        }).catch(handleError)
                });
            });
        });

        describe('application/graphql', () => {
            describe('posts', () => {
                it('should return a list of posts', () => {
                    let query = `
                        query {
                            posts {
                                title
                                content
                                photo
                            }
                        }
                    `;

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/graphql')
                        .send(query)
                        .then((res: ChaiHttp.Response) => {
                            const postList = res.body.data.posts; 
                            expect(res.body.data).to.be.an('object');
                            expect(postList).to.be.an('array');
                            expect(postList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments']);
                            expect(postList[0]).to.have.keys(['title', 'content', 'photo']);
                            expect(postList[0].title).to.equal('First post');
                        }).catch(handleError)
                });

                it('should paginate a list of posts', () => {
                    let query = `
                        query getPostsList($first: Int, $offset: Int) {
                            posts(first: $first, offset: $offset) {
                                title
                                content
                                photo
                            }
                        }
                    `;

                    //no caso de requisições com cabeçalho application/graphql,
                    //precisamos passar os parâmetros via query string como um 
                    //json formatado e atribuido ao atributo variables
                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/graphql')
                        .send(query)
                        .query({
                            variables: JSON.stringify({
                                first: 2,
                                offset: 1
                            })
                        }) //permite enviar uma query string
                        .then((res: ChaiHttp.Response) => {
                            const postList = res.body.data.posts; 
                            expect(res.body.data).to.be.an('object');
                            expect(postList).to.be.an('array').with.length(2);
                            expect(postList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments']);
                            expect(postList[0]).to.have.keys(['title', 'content', 'photo']);
                            expect(postList[0].title).to.equal('Second post');
                        }).catch(handleError)
                });
            })
        })
    });
})