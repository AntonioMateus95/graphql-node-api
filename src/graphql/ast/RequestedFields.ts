import * as graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from "graphql";
import { difference, union } from 'lodash';

export class RequestedFields {

    //dentro do atributo de opções, o array keep manterá os campos que 
    //gostaríamos de manter apesar de não estar dentro do info.
    //já o exclude é exatamente o contrário: ele exclui alguns campos da lista final
    //um bom exemplo é o campo posts dentro do tipo User, que não existe na tabela users,
    //apesar de existir no schema GraphQL
    //ele retorna os campos que iremos enviar para o sequelize
    getFields (info: GraphQLResolveInfo, options?: { keep?: string[], exclude?: string[] }): string[] {
        let fields = Object.keys(graphqlFields(info)); //pegamos o AST que chega no objeto info e separamos
        //apenas as chaves de nível superior do objeto gerado pela função graphqlFields().
        
        if (options) { 
            //se o options.keep tiver sido passado:
            fields = (options.keep) ? union<string>(fields, options.keep) : fields;

            //se o options.exclude tiver sido passado:
            fields = (options.exclude) ? difference<string>(fields, options.exclude) : fields;
        }

        return fields;
    }

}