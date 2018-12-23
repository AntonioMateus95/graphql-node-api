import { Server } from "http";

export const normalizePort = (val: number | string): number | string | boolean => {
    let port: number = (typeof val === 'string') ? parseInt(val) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
}

//event handlers: 
export const onError = (server: Server) => {
    return (error: NodeJS.ErrnoException): void => {
        let port: number | string = server.address().port;
        if (error.syscall !== 'listen') throw error;
        let bind = (typeof port === 'string') ? `pipe ${port}` : `port ${port}`;
        switch(error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

export const onListening = (server: Server) => {
    return (): void => {
        let addr = server.address();
        let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
        console.log(`Listening at ${bind}...`);
    }
}

export const handleError = (error: Error) => {
    //manipulador de erros que trabalha com promise: o utilizaremos no catch das promises
    let errorMessage: string = `${error.name}: ${error.message}`;
    console.log(errorMessage);
    return Promise.reject(new Error(errorMessage));
};

export const throwError = (condition: boolean, message: string) : void => {
    if (condition) throw new Error(message);
}

//não é uma boa prática deixar explícita a chave que assina o token dentro do código
//solução: criar uma variável de ambiente
export const JWT_SECRET: string = process.env.JWT_SECRET;