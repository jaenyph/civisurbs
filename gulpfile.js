'use strict';
const gulp = require('gulp');

gulp.task('default', () => {});

gulp.task('compress-client', ['import-client-libs', 'import-client-contents'], () => {
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

gulp.task('import-client-libs', [
        'import-angular',
        'import-systemjs',
        'import-corejs-shim',
        'import-zonejs',
        'import-rxjs',
        'import-phaser'
    ],
    () => {}
);

gulp.task('import-client-contents', [
        'import-bulma',
        'import-fontawesome'
    ],
    () => {}
);

gulp.task('import-bulma', () => {
    var rename = require("gulp-rename");
    return gulp.src('node_modules/bulma/css/bulma.css*', {
            base: __dirname
        })
        .pipe(rename((path) => {
            path.dirname = path.dirname.replace("node_modules/bulma/css", "");
        }))
        .pipe(gulp.dest(`${__dirname}/client/styles/`));
});

gulp.task('import-fontawesome', [
        'import-fontawesome-css',
        'import-fontawesome-fonts'
    ],
    () => {}
);

gulp.task('import-fontawesome-css', () => {
    var rename = require("gulp-rename");
    return gulp.src('node_modules/font-awesome/css/font-awesome.min.css.*', {
            base: __dirname
        })
        .pipe(rename((path) => {
            path.dirname = path.dirname.replace("node_modules/font-awesome/css", "");
        }))
        .pipe(gulp.dest(`${__dirname}/client/styles/`));
});

gulp.task('import-fontawesome-fonts', () => {
    var rename = require("gulp-rename");
    return gulp.src('node_modules/font-awesome/fonts/*.*', {
            base: __dirname
        })
        .pipe(rename((path) => {
            path.dirname = path.dirname.replace("node_modules/font-awesome/fonts", "");
        }))
        .pipe(gulp.dest(`${__dirname}/client/fonts/`));
});

gulp.task('import-angular', [
        'import-angular-core',
        'import-angular-common',
        'import-angular-compiler',
        'import-angular-platform-browser',
        'import-angular-platform-browser-dynamic',
        'import-angular-http',
        'import-angular-router',
        'import-angular-forms'
    ],
    () => {}
);

gulp.task('import-angular-core', () => {
    return importAngularModule("core", true);
});

gulp.task('import-angular-common', () => {
    return importAngularModule("common", true);
});

gulp.task('import-angular-compiler', () => {
    return importAngularModule("compiler", true);
});

gulp.task('import-angular-platform-browser', () => {
    return importAngularModule("platform-browser", true);
});

gulp.task('import-angular-platform-browser-dynamic', () => {
    return importAngularModule("platform-browser-dynamic", true);
});

gulp.task('import-angular-http', () => {
    return importAngularModule("http", true);
});

gulp.task('import-angular-router', () => {
    return importAngularModule("router", true);
});

gulp.task('import-angular-forms', () => {
    return importAngularModule("forms", true);
});

gulp.task('import-systemjs', () => {
    var rename = require("gulp-rename");
    return gulp.src('node_modules/systemjs/dist/system.js', {
            base: __dirname
        })
        .pipe(rename("system.min.js"))
        .pipe(gulp.dest(`${__dirname}/client/scripts/lib/systemjs`));
});

gulp.task('import-corejs-shim', () => {
    var rename = require("gulp-rename");
    return gulp.src('node_modules/core-js/client/shim.min.js', {
            base: __dirname
        })
        .pipe(rename("shim.min.js"))
        .pipe(gulp.dest(`${__dirname}/client/scripts/lib/corejs`));
});

gulp.task('import-zonejs', () => {
    var rename = require("gulp-rename");
    return gulp.src('node_modules/zone.js/dist/zone.min.js', {
            base: __dirname
        })
        .pipe(rename("zone.min.js"))
        .pipe(gulp.dest(`${__dirname}/client/scripts/lib/zonejs`));
});

gulp.task('import-phaser', () => {
    var rename = require("gulp-rename");
    return gulp.src('node_modules/phaser/build/phaser.min.js', {
            base: __dirname
        })
        .pipe(rename("phaser.min.js"))
        .pipe(gulp.dest(`${__dirname}/client/scripts/lib/phaser`));
});

gulp.task('import-rxjs', () => {
    //TODO:only import necessary files here !!!
    var rename = require("gulp-rename");
    return gulp.src('node_modules/rxjs/**/*.*', {
            base: __dirname
        })
        .pipe(rename((path) => {
            path.dirname = path.dirname.replace("node_modules/rxjs", "");
        }))
        .pipe(gulp.dest(`${__dirname}/client/scripts/lib/rxjs`));
});

const importAngularModule = (moduleName, isMinified) => {
    var rename = require("gulp-rename");
    return gulp.src(`node_modules/@angular/${moduleName}/bundles/${moduleName}.umd.min.js`, {
            base: __dirname
        })
        .pipe(rename(`${moduleName}.umd${isMinified ? ".min" : ""}.js`))
        .pipe(gulp.dest(`${__dirname}/client/scripts/lib/angular`));
};