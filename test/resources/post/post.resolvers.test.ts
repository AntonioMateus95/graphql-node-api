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

    describe('Mutations', () => {
        describe('application/json', () => {
            describe('createPost', () => {
                it('should create a new Post', () => {
                    let body = {
                        query: `
                            mutation createNewPost($input: PostInput!) {
                                createPost(input: $input) {
                                    id
                                    title
                                    content
                                    author {
                                        id
                                        name
                                        email
                                    }
                                }
                            }
                        `,
                        variables: {
                            input: {
                                title: 'Fourth post',
                                content: 'Fourth content',
                                photo: PIKACHU_MEME
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            const createdPost = res.body.data.createPost;
                            expect(createdPost).to.be.an('object');
                            expect(createdPost).to.have.keys(['id', 'title', 'content', 'author']);
                            expect(createdPost.title).to.equal('Fourth post');
                            expect(createdPost.content).to.equal('Fourth content');
                            expect(Number(createdPost.author.id)).to.equal(userId);
                        }).catch(handleError)
                });
            });

            describe('updatePost', () => {
                it('should update an existing Post', () => {
                    let body = {
                        query: `
                            mutation updateExistingPost($id: ID!, $input: PostInput!) {
                                updatePost(id: $id, input: $input) {
                                    title
                                    content
                                    photo
                                }
                            }
                        `,
                        variables: {
                            id: postId,
                            input: {
                                title: 'Post changed',
                                content: 'Content changed',
                                photo: 'some_photo'
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            const updatedPost = res.body.data.updatePost;
                            expect(updatedPost).to.be.an('object')
                            expect(updatedPost).to.have.keys(['title', 'content', 'photo']);
                            expect(updatedPost.title).to.equal('Post changed')
                            expect(updatedPost.content).to.equal('Content changed');
                            expect(updatedPost.photo).to.equal('some_photo');
                        }).catch(handleError)
                });
            });

            describe('deletePost', () => {
                it('should delete an existing Post', () => {
                    let body = {
                        query: `
                            mutation deleteExistingPost($id: ID!) {
                                deletePost(id: $id)
                            }
                        `,
                        variables: {
                            id: postId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            expect(res.body.data).to.have.key('deletePost');
                            expect(res.body.data.deletePost).to.be.true;
                        }).catch(handleError)
                });
            });
        });
    });
})