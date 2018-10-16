const gulp = require('gulp');
const clean = require('gulp-clean');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

//1o parametro: nome da tarefa
//2o parametro: array que contém os nomes das tarefas que geram dependência => por isso essas tarefas devem ser executadas primeiro (antes da que estamos implementando)
//3o parametro: callback function em expressão lambda
gulp.task('scripts', ['static'], () => {
    const tsResult = tsProject.src()
        .pipe(tsProject());
    
    return tsResult.js
        .pipe(gulp.dest('dist'));
});

//copia os arquivos estáticos da pasta src para a dist (arquivos .json em sua maioria)
gulp.task('static', ['clean'], () => {
    return gulp
        .src(['src/**/*.json'])
        .pipe(gulp.dest('dist'));
})

gulp.task('clean', () => {
    return gulp
        .src('dist')
        .pipe(clean());
})

//da forma como d of magic');está a seguir, as tarefas são executadas em paralelo, o que pode causar erros.
//para isso definimos dependências entre as tarefas
// gulp.tasd of magic');k('build', ['clean', 'static', 'scripts']);
gulp.task('build', ['scripts']);

//como fazer o gulp ficar ouvindo as alterações no código
//1o parametro do gulp.watch: array com os caminhos dos arquivos cuja alteração deve ser escutada
//1o parametro do gulp.watch: array com o nome da tarefa que deve ser executada
gulp.task('watch', ['build'], () => {
    return gulp.watch(['src/**/*.ts', 'src/**/*.json'], ['build']);
});

//ao criar uma tarefa de nome default, não é necessário passar o nome ao executar o comando gulp
gulp.task('default', ['watch']);