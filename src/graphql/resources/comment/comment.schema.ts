const commentTypes = `
    type Comment {
        id: ID!
        comment: String!
        createdAt: String!
        updatedAt: String!
        user: User!
        post: Post!        
    }

    # o autor do comentário é o autor logado na api
    # por isso não é necessário passar o id do mesmo na requisição
    input CommentInput {
        comment: String!
        post: Int!
    }
`;

const commentQueries = `
    commentsByPost(postId: ID!, first: Int, offset: Int): [ Comment! ]!
`;

const commentMutations = `
    createComment(input: CommentInput!): Comment
    updateComment(id: ID!, input: CommentInput!): Comment
    deleteComment(id: ID!): Boolean    
`;

export {
    commentTypes,
    commentQueries,
    commentMutations
}