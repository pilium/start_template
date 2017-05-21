var gulp = require( 'gulp' ),
	pug = require( 'gulp-pug' ),
	browsersync = require( 'browser-sync' ),
	concat = require( 'gulp-concat' ),
	uglify = require( 'gulp-uglifyjs' ),
	cssnano = require( 'gulp-cssnano' ),
	rename = require( 'gulp-rename' ),
	del = require( 'del' ),
	imagemin = require( 'gulp-imagemin' ),
	cache = require( 'gulp-cache' ),
	pngquant = require( 'imagemin-pngquant' ),
	less = require( 'gulp-less' ),
	cache = require( 'gulp-cache' ),
	spritesmith = require( "gulp.spritesmith" ),
	plumber = require( "gulp-plumber" ),
	notify = require( "gulp-notify" ),
	newer = require( "gulp-newer" ),
	svgstore = require( "gulp-svgstore" ),
	svgmin = require( "gulp-svgmin" ),
	autoprefixer = require( 'gulp-autoprefixer' ),
	smartgrid = require( 'smart-grid' ),
	gcmq = require( 'gulp-group-css-media-queries' ),
	mainBowerFiles = require( 'main-bower-files' );

  // Работа с Pug
  gulp.task('pug', function () {
      return gulp.src('dev/pug/pages/*.pug')
          .pipe(plumber())
          .pipe(pug({
              pretty: true //минификация: False
          }))
          .on("error", notify.onError(function (error) {
              return "Message to the notifier: " + error.message;
          }))
          .pipe(gulp.dest('dev'));
  });


  // Работа с JavaScript
  gulp.task('main-js', function() {
  	return gulp.src([
  		'dev/static/js/main.js',
  		])
  	.pipe(concat('main.min.js'))
  	.pipe(uglify())
  	.pipe(gulp.dest('dev/static/js'));
  });

  gulp.task('js', ['main-js'], function() {
  	return gulp.src([
       'dev/static/mainFiles/js/jquery.min.js',
  		'dev/static/mainFiles/js/*.js',
  		'dev/static/js/main.min.js', // Всегда в конце
  		])
  	.pipe(concat('scripts.min.js'))
    .pipe(uglify()) // Минимизировать весь js (на выбор)
  	.pipe(gulp.dest('dev/static/js'))
  	.pipe(browsersync.reload({stream: true}));
  });

  // Работа с Less
  gulp.task('less', function () {
      return gulp.src('dev/static/less/main.less')
          .pipe(plumber())
          .pipe(less({
              'include css': true
          }))


      .on("error", notify.onError(function (error) {
              return "Message to the notifier: " + error.message;
          }))
          .pipe(gcmq())
          .pipe(autoprefixer(['last 2 version']))
          .pipe(gulp.dest('dev/static/css'))
          .pipe(browsersync.reload({
              stream: true
          }));
  });


  //Browsersync
  gulp.task('browsersync', function () {
      browsersync({
          server: {
              baseDir: 'dev'
          },
      });
  });



  // Сборка спрайтов PNG
  gulp.task('cleansprite', function () {
      return del.sync('dev/static/img/sprite/sprite.png');
  });

  gulp.task('spritemade', function () {
      var spriteData =
          gulp.src('dev/static/img/sprite/*.*')
          .pipe(spritesmith({
              imgName: '../img/sprite/sprite.png',
              cssName: '_sprite.less',
              padding: 15,
              cssFormat: 'less',
              algorithm: 'binary-tree',

          }));

      spriteData.img.pipe(rename('sprite.png')).pipe(gulp.dest('dev/static/img/sprite/')); // путь, куда сохраняем картинку
      spriteData.css.pipe(gulp.dest('dev/static/less/')); // путь, куда сохраняем стили
  });
  gulp.task('sprite', ['cleansprite', 'spritemade']);

  // Сборка спрайтов SVG
  gulp.task('cleanspriteSvg', function () {
      return del.sync('dev/static/img/sprite/sprite.svg');
  });

  gulp.task('spritemadeSvg', function () {
      return gulp.src('dev/static/img/sprite/*.svg')
          .pipe(svgmin())
          .pipe(svgstore({
              inlineSvg: true
          }))
          .pipe(rename("spriteSvg.svg"))
          .pipe(gulp.dest("dev/static/img/sprite/"));
  });
  gulp.task('spriteSvg', ['cleanspriteSvg', 'spritemade']);

  // Очистка папки сборки
  gulp.task('clean', function () {
      return del.sync('product');
  });

  // Оптимизация изображений
  gulp.task('img', function () {
      return gulp.src(['dev/static/img/**/*.{png,jpg,gif}', '!dev/static/img/sprite/*'])
          .pipe(cache(imagemin({
              optimizationLevel: 3,
              progressive: true,
              use: [pngquant()]

          })))
          .pipe(gulp.dest('product/static/img'));
  });

  // Main Files
  gulp.task('mainJS', function() {
      return gulp.src(mainBowerFiles('**/*.js'))
      .pipe(concat('libs.min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dev/static/mainFiles/js/'))
      .pipe(browsersync.reload({
                  stream: true
              }));
  });

  gulp.task('mainCSS', function() {
      return gulp.src(mainBowerFiles('**/*.css'))
      .pipe(concat('libs.min.css'))
      .pipe(cssnano())
      .pipe(gulp.dest('dev/static/mainFiles/css/'));
  });

  gulp.task('main', ['mainJS','mainCSS']);


  // Watcher
  gulp.task('watch', ['main','pug','less', 'js', 'browsersync'], function() {
  	gulp.watch('dev/static/less/**/*.less', ['less']);
    gulp.watch('dev/pug/**/*.pug', ['pug']);
  	gulp.watch(['libs/**/*.js', 'dev/static/js/main.js'], ['js']);
  	gulp.watch('dev/*.html', browsersync.reload);
  });

  // Сборка
  gulp.task('build', ['clean', 'img', 'less','pug', 'js'], function() {

  	var buildFiles = gulp.src([
  		'dev/*.html'
  		]).pipe(gulp.dest('product'));

  	var buildCss = gulp.src([
  		'dev/static/css/main.css',
      'dev/static/css/ajax-loader.gif',
    ]).pipe(gulp.dest('product/static/css'));

  	var buildJs = gulp.src([
  		'dev/static/js/scripts.min.js',
    ]).pipe(gulp.dest('product/static/js'));

    var buildFonts = gulp.src('dev/static/fonts/**/*')
      .pipe(gulp.dest('product/static/fonts'));

    var buildImg = gulp.src('dev/static/img/sprite/sprite.png')
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest('product/static/img/sprite/'));
    var buildSvg = gulp.src('dev/static/img/sprite/spriteSvg.svg')
        .pipe(gulp.dest('product/static/img/sprite/'));

  });


  // Очистка кеша
  gulp.task('clear', function () {
      return cache.clearAll();
  });

  // Дефолтный таск
   gulp.task('default', ['watch']);

//   // Smart-grid
//   var settings = {
//       outputStyle: 'less',
//       columns: 12,
//       offset: "1%",
//       container: {
//           maxWidth: '1200px', /* max-width оn very large screen */
//           fields: '30px' /* side fields */
//       },
//       breakPoints: {
//           lg: {
//               'width': '1100px', /* -> @media (max-width: 1100px) */
//               'fields': '30px' /* side fields */
//           },
//           md: {
//               'width': '960px',
//               'fields': '15px'
//           },
//           sm: {
//               'width': '780px',
//               'fields': '15px'
//           },
//           xs: {
//               'width': '560px',
//               'fields': '15px'
//           }
//           /*
//           We can create any quantity of break points.
//
//           some_name: {
//               some_width: 'Npx',
//               some_offset: 'N(px|%)'
//           }
//           */
//       }
//   };
//   smartgrid('dev/static/less/modules',settings);
