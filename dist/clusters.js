"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cluster = require("cluster");
const os_1 = require("os");
class Clusters {
    constructor() {
        /* O método cpus() retorna um array de objetos do tipo CpuInfo e cada elemento
        contém informações sobre cada núcleo lógico disponível no nosso processador */
        this.cpus = os_1.cpus();
        this.init();
    }
    init() {
        //se for o processo principal da aplicação:
        if (cluster.isMaster) {
            console.log('MAIN...');
            //pega a quantidade de núcleos e instancia os processos filhos
            this.cpus.forEach(() => cluster.fork());
            //configuração de eventos:
            //quando o processo estiver ouvindo na porta da aplicação:
            cluster.on('listening', (worker) => {
                console.log('Cluster %d connected', worker.process.pid);
            });
            //quando o processo worker sair da rede de clusters por algum motivo:
            cluster.on('disconnect', (worker) => {
                console.log('Cluster %d disconnected', worker.process.pid);
            });
            //quando o processo worker não estiver sendo mais executado
            cluster.on('exit', (worker) => {
                console.log('Cluster %d exitted', worker.process.pid);
                //cria um novo processo filho
                cluster.fork();
            });
        }
        else {
            console.log('WORKER...');
            //se for um processo filho:
            require('./index'); //sobe o nosso servidor
            //detalhe: todos os processos filhos compartilharão a mesma porta (3000)
        }
    }
}
exports.default = new Clusters();
