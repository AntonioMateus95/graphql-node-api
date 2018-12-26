import { DbConnection } from "./DbConnectionInterface";
import { AuthUser } from "./AuthUserInterface";
import { DataLoaders } from "./DataLoadersInterface";
import { RequestedFields } from "../graphql/ast/RequestedFields";

export interface ResolverContext {
    //instância do banco de dados aberta para usar no sequelize
    db?: DbConnection;
    //token
    authorization?: string;
    //usuário logado
    authUser?: AuthUser;
    //data loaders
    dataLoaders?: DataLoaders
    //requested fields
    requestedFields?: RequestedFields 
}