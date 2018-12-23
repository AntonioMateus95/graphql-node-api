"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//a função abaixo recebe os resolvers que queremos executar antes do resolver final
//...: operador rest (o que não tem relação alguma com o padrão REST para APIs)
//do ECMAScript 6: equivalente ao params do C#
//pega todos os parametros e junta num array de parametros do mesmo tipo
function compose(...funcs) {
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
    return (f) => {
        let result = last(f);
        for (let index = funcs.length - 2; index >= 0; index--) {
            const fn = funcs[index];
            result = fn(result);
        }
        return result;
    };
}
exports.compose = compose;
