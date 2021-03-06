import { GraphQLFieldResolver } from "graphql";

import { ComposableResolver } from "./composable.resolver";
import { ResolverContext } from "../../interfaces/ResolverContextInterface";
import { verifyTokenResolver } from "./verify-token.resolver";

//Resolver reutilizável
/* Esse pequeno resolver servirá apenas para verificar
se a requisição que está sendo feita para uma query ou 
mutation protegida esá sendo autenticada */
/* O tipo do TSource foi definido como any porque pode ser 
um UserInstance, um CommentInstance ou qualquer outro tipo */
export const authResolver: ComposableResolver<any, ResolverContext> = 
    (resolver: GraphQLFieldResolver<any, ResolverContext>) : GraphQLFieldResolver<any, ResolverContext> => {
        //espécie de callback
        return (parent, args, context: ResolverContext, info) => {
            //aqui só estamos validando se um token foi recebido, mas não se ele está válido
            if (context.authUser || context.authorization) {
                // o resolver recebido como parâmetro se assemelha ao next dos middlewares do Express
                return resolver(parent, args, context, info);
            }
            else {
                throw new Error('Unauthorized: Token not provided!');
            }
        };
    };

export const authResolvers = [ authResolver, verifyTokenResolver ];