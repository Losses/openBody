var gulp       = require("gulp"),
    browserify = require('browserify'),
    //reactify   = require('reactify'),
    source     = require('vinyl-source-stream'),
    concat     = require('gulp-concat'),
    minifyCss  = require('gulp-minify-css'),
    babelify   = require('babelify');

gulp.task('jsx', function () {
    browserify('./app/assets/scripts/main.jsx')
        .transform(babelify, {
            presets: ['es2015', 'react']
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('app/assets/builds/'));
});

gulp.task('css', function(){
    gulp.src(['./app/assets/fonts/**/*.css', './app/assets/styles/**/*.css'])
        .pipe(concat('./app/assets/builds/bundle.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  gulp.watch('./app/assets/scripts/**/*.jsx', ['jsx']);
  gulp.watch('./app/assets/**/*.css', ['css']);
});