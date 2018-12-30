import { JWT_SECRET } from '../../../src/utils/utils';
import * as jwt from 'jsonwebtoken';

import { chai, db, handleError, expect, app } from "../../test-utils";
import { UserInstance } from "../../../src/models/UserModel";
import { PostInstance } from '../../../src/models/PostModel';
import { PIKACHU_MEME } from '../../images/pikachu-meme';
import { CommentInstance } from '../../../src/models/CommentModel';

describe('Comment', () => {
    let userId: number;
    let userToken: string;
    let postId: number;
    let commentId: number;

    beforeEach(() => {
        return db.Comment.destroy({ where: { } })
            .then((rows: number) => db.Post.destroy({ where: {} }))
            .then((rows: number) => db.User.destroy({ where: {} }))
            .then((rows: number) => db.User.create(
                {
                    name: 'Peter Quill',
                    email: 'peter@guardians.com',
                    password: '1234'
                }
            )).then((user: UserInstance) => {
                userId = user.get('id');
                const payload = { sub: userId };
                userToken = jwt.sign(payload, JWT_SECRET);
            
                return db.Post.create(
                    {
                        title: 'First post',
                        content: 'First post',
                        author: userId,
                        photo: PIKACHU_MEME
                    }
                );
            }).then((post: PostInstance) => {
                postId = post.get('id');

                return db.Comment.bulkCreate([
                    {
                        comment: 'First comment',
                        user: userId,
                        post: postId
                    },
                    {
                        comment: 'Second comment',
                        user: userId,
                        post: postId
                    },
                    {
                        comment: 'Third comment',
                        user: userId,
                        post: postId
                    }
                ])
            }).then((comments: CommentInstance[]) => {
                commentId = comments[0].get('id');
            });
    });

    describe('Queries', () => {
        describe('application/json', () => {
            describe('commentsByPost', () => {
                it('should return a list of comments', () => {
                    let body = {
                        query: `
                            query getCommentsByPostList($postId: ID!, $first: Int, $offset: Int) {
                                commentsByPost(postId: $postId, first: $first, offset: $offset) {
                                    comment
                                    user {
                                        id
                                    }
                                    post {
                                        id
                                    }
                                }
                            }
                        `,
                        variables: {
                            postId: postId
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            const commentsList = res.body.data.commentsByPost; 
                            expect(res.body.data).to.be.an('object');
                            expect(commentsList).to.be.an('array');
                            expect(commentsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt']);
                            expect(commentsList[0]).to.have.keys(['comment', 'user', 'post']);
                            expect(Number(commentsList[0].user.id)).to.equal(userId);
                            expect(Number(commentsList[0].user.id)).to.equal(postId);
                        }).catch(handleError)
                })
            })
        })
    });

    describe('Mutations', () => {
        describe('application/json', () => {
            describe('createComment', () => {
                it('should create a new comment', () => {
                    let body = {
                        query: `
                            mutation createNewComment($input: CommentInput!) {
                                createComment(input: $input) {
                                    comment
                                    user {
                                        id
                                        name
                                    }
                                    post {
                                        id
                                        title
                                    }
                                }
                            }
                        `,
                        variables: {
                            input: {
                                comment: 'Fourth comment',
                                post: postId
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            const createdComment = res.body.data.createComment; 
                            expect(res.body.data).to.be.an('object');
                            expect(res.body.data).to.have.key('createComment');
                            expect(createdComment).to.be.an('object');
                            expect(createdComment).to.have.keys(['comment', 'user', 'post']);
                            expect(Number(createdComment.user.id)).to.equal(userId);
                            expect(createdComment.user.name).to.equal('Peter Quill');
                            expect(Number(createdComment.post.id)).to.equal(postId);
                            expect(createdComment.post.title).to.equal('First post');
                        }).catch(handleError)
                })
            });

            describe('updateComment', () => {
                it('should update an existing comment', () => {
                    let body = {
                        query: `
                            mutation updateExistingComment($id: ID!, $input: CommentInput!) {
                                updateComment(id: $id, input: $input) {
                                    id
                                    comment
                                }
                            }
                        `,
                        variables: {
                            id: commentId,
                            input: {
                                comment: 'Comment changed',
                                post: postId
                            }
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            const updatedComment = res.body.data.updateComment; 
                            expect(res.body.data).to.be.an('object');
                            expect(res.body.data).to.have.key('updateComment');
                            expect(updatedComment).to.be.an('object');
                            expect(updatedComment).to.have.keys(['id', 'comment']);
                            expect(updatedComment.comment).to.equal('Comment changed');
                        }).catch(handleError)
                });
            });

            describe('deleteComment', () => {
                it('should delete an existing comment', () => {
                    let body = {
                        query: `
                            mutation deleteExistingComment($id: ID!) {
                                deleteComment(id: $id)
                            }
                        `,
                        variables: {
                            id: commentId,
                        }
                    };

                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${userToken}`)
                        .send(JSON.stringify(body))
                        .then((res: ChaiHttp.Response) => {
                            expect(res.body.data).to.be.an('object');
                            expect(res.body.data).to.have.key('deleteComment');
                            expect(res.body.data.deleteComment).to.be.true;
                        }).catch(handleError)
                });
            });
        });
    });
})