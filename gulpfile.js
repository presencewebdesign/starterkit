/**
 * A simple Gulp 4 Starter Kit for modern web development.
 *
 * @package @jr-cologne/create-gulp-starter-kit
 * @author JR Cologne <kontakt@jr-cologne.de>
 * @copyright 2019 JR Cologne
 * @license https://github.com/jr-cologne/gulp-starter-kit/blob/master/LICENSE MIT
 * @version v0.10.11-beta
 * @link https://github.com/jr-cologne/gulp-starter-kit GitHub Repository
 * @link https://www.npmjs.com/package/@jr-cologne/create-gulp-starter-kit npm package site
 *
 * ________________________________________________________________________________
 *
 * gulpfile.js
 *
 * The gulp configuration file.
 *
 */

const 
gulp               = require('gulp'),
del                = require('del'),
sourcemaps         = require('gulp-sourcemaps'),
plumber            = require('gulp-plumber'),
sass               = require('gulp-sass'),
autoprefixer       = require('gulp-autoprefixer'),
minifyCss          = require('gulp-clean-css'),
babel              = require('gulp-babel'),
webpack            = require('webpack-stream'),
uglify             = require('gulp-uglify'),
concat             = require('gulp-concat'),
imagemin           = require('gulp-imagemin'),
browserSync        = require('browser-sync').create(),
node_dependencies  = Object.keys(require('./package.json').dependencies || {});

const paths = require('./components/paths');

const babelIgnore = [
    paths.src_assets_qq_folder + 'a_supporting.js',
];

// Choose type Gulp watch project by using command --type 
// gulp watch-project --type abandonment

folder = (type) => {
    const data =  require('./components/projects')(type)
    return data
}

//################ Run Clear ################

gulp.task('clear', () => del([ paths.dist_folder_clear ]));
gulp.task('clear-project', () => del([ folder("dist") ]));


//################ Run Build ################

gulp.task('html', () => {
  return gulp.src([ paths.src_folder + '**/*.html' ], { base: paths.src_folder })
    .pipe(gulp.dest(paths.dist_folder))
    .pipe(browserSync.stream());
});

gulp.task('sass', () => {
  return gulp.src([ paths.src_assets_folder + 'sass/**/*.sass' ])
    .pipe(sourcemaps.init())
      .pipe(plumber())
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(minifyCss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist_assets_folder + 'css'))
    .pipe(browserSync.stream());
});

gulp.task('js', () => {
  return gulp.src([ paths.src_assets_folder + 'js/**/*.js' ])
    .pipe(plumber())
    .pipe(webpack({
      mode: 'production'
    }))
    .pipe(sourcemaps.init())
      .pipe(babel({
        presets: [ 'env' ]
      }))
      .pipe(concat('all.js'))
      .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist_assets_folder + 'js'))
    .pipe(browserSync.stream());
});

gulp.task('images', () => {
    return gulp.src([ paths.src_assets_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)' ])
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist_assets_folder + 'images'))
    .pipe(browserSync.stream());
});

gulp.task('vendor', () => {
if (node_dependencies.length === 0) {
    return new Promise((resolve) => {
        console.log("No dependencies specified");
        resolve();
    });
}

return gulp.src(node_dependencies.map(dependency => paths.node_modules_folder + dependency + '/**/*.*'), { base: paths.node_modules_folder })
    .pipe(gulp.dest(paths.dist_node_modules_folder))
    .pipe(browserSync.stream());
});

gulp.task('build', gulp.series('clear', 'html', 'sass', 'js', 'images', 'vendor'));




//################ Run Custom Project ################

gulp.task('project', () => {
    return gulp.src([ folder("src") + '**/*.js' ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: [ 'env' ],
        ignore: babelIgnore
    }))
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(folder("dist")))
    .pipe(browserSync.stream());
});

gulp.task('quickquote', gulp.series('clear-project', 'project'));

gulp.task('watch-project', () => {
    let watch = [
        folder("src") + '**/*.js'
    ];

    node_dependencies.forEach(dependency => {
        watch.push(paths.node_modules_folder + dependency + '/**/*.*');
    });

    gulp.watch(watch, gulp.series('project'));
});



//################ Run Default ################


// Run default with npm start
gulp.task('serve', () => {
    return browserSync.init({
        server: {
            baseDir: [ 'dist' ],
            port: 3000
        },
        open: false
    });
});

gulp.task('watch', () => {
    let watch = [
        paths.src_folder + '**/*.html',
        paths.src_assets_folder + 'sass/**/*.sass',
        paths.src_assets_folder + 'js/**/*.js',
        paths.src_assets_folder + 'images/**/*.+(png|jpg|jpeg|gif|svg|ico)'
    ];

    node_dependencies.forEach(dependency => {
        watch.push(paths.node_modules_folder + dependency + '/**/*.*');
    });

    gulp.watch(watch, gulp.series('build')).on('change', browserSync.reload);
});


gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')));