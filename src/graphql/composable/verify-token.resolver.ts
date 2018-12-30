import * as jwt from 'jsonwebtoken';
import { GraphQLFieldResolver } from "graphql";

import { ComposableResolver } from "./composable.resolver";
import { ResolverContext } from "../../interfaces/ResolverContextInterface";
import { JWT_SECRET } from '../../utils/utils';

export const verifyTokenResolver: ComposableResolver<any, ResolverContext> = 
    (resolver: GraphQLFieldResolver<any, ResolverContext>): GraphQLFieldResolver<any, ResolverContext> => {

        return (parent, args, context: ResolverContext, info) => {
        
            const token: string = context.authorization.split(' ')[1]; //Bearer ahgagdghs

            return jwt.verify(token, JWT_SECRET, (err, payload: any) => {
                if (!err) {
                    return resolver(parent, args, context, info);
                }
                throw new Error(`${err.name}: ${err.message}`);
            });

        };

    };