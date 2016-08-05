/* eslint-disable import/no-extraneous-dependencies */
import gulp from 'gulp';

import babel from 'gulp-babel';
import browserify from 'gulp-browserify';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify';

const files = {
  rawJS: ['./src/**/*.js'],
};

gulp.task('transpile', () =>
  gulp.src(files.rawJS)
    .pipe(babel())
    .pipe(gulp.dest('./build'))
);

gulp.task('browserify', ['transpile'], () =>
  gulp.src('./build/gmusic-ui.js')
    .pipe(browserify({
      standalone: 'GMusicUI'
    }))
    .pipe(rename('gmusic-ui.js'))
    .pipe(gulp.dest('./dist'))
);

gulp.task('uglify', ['browserify'], () =>
  gulp.src('./dist/gmusic-ui.js')
    .pipe(uglify())
    .pipe(rename('gmusic-ui.min.js'))
    .pipe(gulp.dest('./dist'))
);

gulp.task('build', ['uglify']);
