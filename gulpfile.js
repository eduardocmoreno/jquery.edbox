var gulp = require('gulp');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();

gulp.task('css', function(){
	return gulp.src('app/css/*.css')
	.pipe(browserSync.stream());
});

gulp.task('watch', function() {
	browserSync.init({
		server: './'
	});
	gulp.watch('app/css/*.css', ['css']);
	gulp.watch(['app/*.html','app/js/**/*.js']).on('change', browserSync.reload);
});

gulp.task('default', function(){
	gulp.start('watch');
});