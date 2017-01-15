'use strict';
const gulp = require('gulp');

gulp.task('default', ['compile-client', 'compile-server']);

gulp.task('compile-server', () => {
    //TODO: define this task
    return gulp.src('server/**/');
});

gulp.task('compile-client', () => {
    const ts = require('gulp-typescript');
    return gulp.src('client/**/*.ts')
        .pipe(ts({
            noImplicitAny: true,
            module: 'system',
            removeComments: true,
            noEmitOnError: true,
            out: 'app.js'
        }))
        .pipe(gulp.dest('client/built/scripts'));
});

gulp.task('compress-client', () => {
    const uglify = require('gulp-uglify');
    return gulp.src('client/built/scripts/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('client/built/compressedScripts'))
        .on("finish", () => {
            //swap the compressedScripts and the scripts folders:
            var del = require('del');
            del.sync(['client/built/scripts/**/*']);
            const fs = require('fs');
            fs.renameSync('client/built/compressedScripts', 'client/built/scripts');
        });
});
