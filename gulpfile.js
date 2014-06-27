/**
 * La Plata JS gulpfile
 */

/** gulp **/
var gulp = require( 'gulp' );

/** gulp plugins **/
var jade = require( 'gulp-jade' );
var stylus = require( 'gulp-stylus' );

/* extra */
var nib = require( './node_modules/gulp-stylus/node_modules/nib' );

/** gulp tasks **/
gulp.task('jade', function() {
  var YOUR_LOCALS = {};

  gulp.src('./tpl/*.jade')
    .pipe(jade({
      locals: YOUR_LOCALS
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('stylus', function () {
  gulp.src('./public/style/**/*.styl')
    .pipe(stylus({use: [nib()]}))
    .pipe(gulp.dest('./public/style'));
});

gulp.task('style', ['stylus']);
gulp.task('template', ['jade']);
gulp.task('default', ['jade', 'stylus']);