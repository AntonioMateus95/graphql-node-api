import { GraphQLFieldResolver } from "graphql";

//type é semelhante a uma interface
//genérico => serviria caso quiséssemos tipar o Source e o contexto dentro do resolver
export type ComposableResolver<TSource, TContext> = 
    (fn: GraphQLFieldResolver<TSource, TContext>) => GraphQLFieldResolver<TSource, TContext>;

//a função abaixo recebe os resolvers que queremos executar antes do resolver final
//...: operador rest (o que não tem relação alguma com o padrão REST para APIs)
//do ECMAScript 6: equivalente ao params do C#
//pega todos os parametros e junta num array de parametros do mesmo tipo
export function compose<TSource, TContext>(
    ...funcs: Array<ComposableResolver<TSource, TContext>>
): ComposableResolver<TSource, TContext> {

    if (funcs.length === 0) {
        // if no functions return the identity (função identidade)
        return o => {            
            return o;
        };
    }
    
    if (funcs.length === 1) {
        return funcs[0];
    }
    
    const last = funcs[funcs.length - 1];
    return (f: GraphQLFieldResolver<TSource, TContext>): GraphQLFieldResolver<TSource, TContext> => {
        let result = last(f);
        for (let index = funcs.length - 2; index >= 0; index--) {
            const fn = funcs[index];
            result = fn(result);
        }
        return result;
    }
}