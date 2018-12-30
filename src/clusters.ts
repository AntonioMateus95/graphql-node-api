import * as cluster from 'cluster';
import { CpuInfo, cpus } from 'os';

class Clusters {
    private cpus: CpuInfo[];

    constructor() {
        /* O método cpus() retorna um array de objetos do tipo CpuInfo e cada elemento
        contém informações sobre cada núcleo lógico disponível no nosso processador */
        this.cpus = cpus(); 
        this.init();
    }

    init() : void {
        //se for o processo principal da aplicação:
        if (cluster.isMaster) {
            console.log('MAIN...');
            //pega a quantidade de núcleos e instancia os processos filhos
            this.cpus.forEach(() => cluster.fork());

            //configuração de eventos:
            //quando o processo estiver ouvindo na porta da aplicação:
            cluster.on('listening', (worker: cluster.Worker) => {
                console.log('Cluster %d connected', worker.process.pid);
            });

            //quando o processo worker sair da rede de clusters por algum motivo:
            cluster.on('disconnect', (worker: cluster.Worker) => {
                console.log('Cluster %d disconnected', worker.process.pid);
            });

            //quando o processo worker não estiver sendo mais executado
            cluster.on('exit', (worker: cluster.Worker) => {
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

export default new Clusters();