const gulp = require('gulp');

const babel = require('gulp-babel');
const browserify = require('gulp-browserify');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

const files = {
  rawJS: ['./src/**/*.js'],
};

gulp.task('transpile', () =>
  gulp.src(files.rawJS)
    .pipe(babel())
    .pipe(gulp.dest('./build'))
);

gulp.task('browserify', gulp.series('transpile', () =>
  gulp.src('./build/gmusic-ui.js')
    .pipe(browserify({
      standalone: 'GMusicUI',
    }))
    .pipe(rename('gmusic-ui.js'))
    .pipe(gulp.dest('./dist'))
));

gulp.task('uglify', gulp.series('browserify', () =>
  gulp.src('./dist/gmusic-ui.js')
    .pipe(uglify())
    .pipe(rename('gmusic-ui.min.js'))
    .pipe(gulp.dest('./dist'))
));

gulp.task('build', gulp.series('uglify'));
