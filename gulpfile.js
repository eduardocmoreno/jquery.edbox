//global
var gulp           = require('gulp');
var clean          = require('gulp-clean');
var filter         = require('gulp-filter');
var rename         = require('gulp-rename');
var browserSync    = require('browser-sync').create();

//css
var autoprefixer   = require('gulp-autoprefixer');
var sass           = require('gulp-sass');
var sourcemaps     = require('gulp-sourcemaps')
var cleanCSS       = require('gulp-clean-css');

//js
var uglify         = require('gulp-uglify');

//Bower
var bower          = require('bower');
var mainBowerFiles = require('gulp-main-bower-files');

//Log de erros
function logError (error) {
    console.log(error.toString());
    this.emit('end');
}

//Limpa os diretorios dos componentes do bower
gulp.task('bowerClean', function(){
    return gulp.src('assets/components/*')
    .pipe(clean());
});

//Copia os arquivos bower para a pasta public
gulp.task('bower', ['bowerClean'], function(){
    return bower.commands.update([], {save: true}, {})
    .on('end', function(){
        var jsFilter = filter('**/*.js', {restore: true});
        var cssFilter = filter('**/*.css', {restore: true});

        gulp.src('bower.json')
        .pipe(mainBowerFiles())
        .pipe(jsFilter)
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('assets/components'))
        .pipe(jsFilter.restore)

        .pipe(cssFilter)
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('assets/components'));
    });
});

//JS - distribution
gulp.task('js:dist', function(){
    return gulp.src('assets/js/**/*.js')
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
});

//SASS-CSS - development
gulp.task('sass:dev', function() {
    return gulp.src('assets/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('assets/css'))
    .pipe(browserSync.stream());
});

//SASS-CSS - distribution
gulp.task('sass:dist', function() {
    return gulp.src('assets/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest('dist'))
    .pipe(cleanCSS())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
});

//Assets - distribution
gulp.task('assets:dist', function(){
    gulp.src('assets/images/loading.svg')
    .pipe(gulp.dest('dist'));
});

//Clean dist folder
gulp.task('clean:dist', function(){
    gulp.src('dist')
    .pipe(clean());
});

//Default task
gulp.task('default', function(){
    browserSync.init({
        server: "./"
    });
    gulp.watch('assets/scss/**/*.scss', ['sass:dev']);
    gulp.watch(['**/*.html','assets/js/**/*.js']).on('change', browserSync.reload);
});

//Dist task
gulp.task('dist', ['clean:dist'], function(){
    gulp.start('sass:dist','js:dist','assets:dist');
});