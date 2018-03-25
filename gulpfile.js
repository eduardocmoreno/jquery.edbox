//global
var browserSync = require('browser-sync').create();
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var gulp = require('gulp');
var rename = require('gulp-rename');
var zip = require('gulp-zip');

//css
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');

//js
var uglify = require('gulp-uglify');

//Log de erros
function logError(error) {
  console.log(error.toString());
  this.emit('end');
}

//JS Dev Files
var jsFiles = [
  'node_modules/prismjs/prism.js',
  'node_modules/jquery/dist/jquery.js',
  'docs/assets/js/jquery.edbox.js'
]

//JS - dev
gulp.task('js:dev', function () {
  return gulp.src(jsFiles)
    .pipe(concat('app.js'))
    .pipe(gulp.dest('docs/assets/js'))
    .pipe(browserSync.stream());
});

//JS - docs dist
gulp.task('js:docs:dist', function () {
  return gulp.src(jsFiles)
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest('docs/assets/js'));
});

//JS - module dist
gulp.task('js:module:dist', function () {
  return gulp.src('docs/assets/js/jquery.edbox.js')
    .pipe(gulp.dest('dist'))
    .pipe(uglify({
      preserveComments: 'all'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
});

//SASS-CSS files
var cssDevFiles = [
  'node_modules/prismjs/themes/prism.css',
  'node_modules/animate.css/animate.css',
  'docs/assets/scss/edbox.scss',
  'docs/assets/scss/app.scss',
]

//SASS-CSS - dev
gulp.task('sass:dev', function () {
  return gulp.src(cssDevFiles)
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(gulp.dest('docs/assets/css'))
    .pipe(browserSync.stream());
});

//SASS-CSS - dist
gulp.task('sass:dist', function () {
  return gulp.src('docs/assets/scss/edbox.scss')
    .pipe(gulp.dest('dist'))
    .pipe(autoprefixer())
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist'))
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
});

//Assets - distribution
gulp.task('assets:dist', function () {
  return gulp.src('docs/assets/images/loading.svg')
    .pipe(gulp.dest('dist'));
});

//Clean dist folder
gulp.task('clean:dist', function () {
  return gulp.src('dist')
    .pipe(clean());
});

//Default task
gulp.task('default', function () {
  browserSync.init({
    server: "docs"
  });
  gulp.watch('docs/assets/scss/**/*.scss', ['sass:dev']);
  gulp.watch('docs/assets/js/**/*.js', ['js:dev']);
  gulp.watch('**/*.html').on('change', browserSync.reload);
});

//Dist task
gulp.task('dist', ['clean:dist'], function () {
  return gulp.start('sass:dist', 'js:docs:dist', 'js:module:dist', 'assets:dist');
});

//Zip task
gulp.task('zip', function () {
  gulp.src('dist/**')
    .pipe(zip('docs/jquery.edbox.zip'))
    .pipe(gulp.dest('./'));
});