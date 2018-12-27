import { db } from './test-utils';

/* Este arquivo servirá para fazer a sincronização do
Sequelize com o MySQL e então avisar o mocha que ele já
pode executar os testes. */

//o parâmetro force obriga o sequelize a recriar o banco de
//dados toda vez para que tenhamos um banco de dados novo pra
//trabalhar
//run: continua a execução dos testes
db.sequelize.sync({ force: true })
    .then(() => run());