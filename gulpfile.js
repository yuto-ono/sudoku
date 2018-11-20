var gulp = require("gulp");
var browser = require("browser-sync").create();
var plumber = require("gulp-plumber");
var notify = require("gulp-notify");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var sourcemaps = require("gulp-sourcemaps");

gulp.task("server", function() {
	return browser.init({
		ghostMode: false,
		server: {
			baseDir: "docs"
		}
	});
});

gulp.task("sass", function(done) {
	return gulp.src("sass/**/*.scss")
		.pipe(plumber({ errorHandler: notify.onError('<%= error.message %>') }))
		// .pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: "expanded" })) //outputStyle: "compressed" にすると圧縮
		.pipe(autoprefixer({
			browsers: ["last 2 versions", "ie >= 11", "Android >= 4.4", "ios_saf >= 11"]
		}))
		// .pipe(sourcemaps.write(""))
		.pipe(gulp.dest("docs/css"))
		.pipe(browser.stream());
	done();
});

gulp.task("watch", function() {
	gulp.watch("docs/**/*.html").on("change", browser.reload);
	gulp.watch("sass/**/*.scss", gulp.series("sass"));
});

gulp.task("default", gulp.parallel("sass", "server", "watch"));
