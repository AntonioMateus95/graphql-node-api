"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphqlFields = require("graphql-fields");
const lodash_1 = require("lodash");
class RequestedFields {
    //dentro do atributo de opções, o array keep manterá os campos que 
    //gostaríamos de manter apesar de não estar dentro do info.
    //já o exclude é exatamente o contrário: ele exclui alguns campos da lista final
    //um bom exemplo é o campo posts dentro do tipo User, que não existe na tabela users,
    //apesar de existir no schema GraphQL
    //ele retorna os campos que iremos enviar para o sequelize
    getFields(info, options) {
        let fields = Object.keys(graphqlFields(info)); //pegamos o AST que chega no objeto info e separamos
        //apenas as chaves de nível superior do objeto gerado pela função graphqlFields().
        if (options) {
            //se o options.keep tiver sido passado:
            fields = (options.keep) ? lodash_1.union(fields, options.keep) : fields;
            //se o options.exclude tiver sido passado:
            fields = (options.exclude) ? lodash_1.difference(fields, options.exclude) : fields;
        }
        return fields;
    }
}
exports.RequestedFields = RequestedFields;
