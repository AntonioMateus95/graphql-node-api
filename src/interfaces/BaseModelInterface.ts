import { ModelsInterface } from "./ModelsInterface";

export interface BaseModelInterface {
    //métodos de instância
    prototype?;
    //método de classe: serve para associar um model a outro
    associate?(models: ModelsInterface): void
}