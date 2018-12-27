import { GraphQLResolveInfo } from "graphql";

//T é o tipo do campo que representa o id
export interface DataLoaderParam<T> {
    
    //será usado para informar o id do registro
    key: T; 

    //conterá os parâmetros provenientes da query
    info: GraphQLResolveInfo;

}