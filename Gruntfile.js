module.exports = (grunt) => {
  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015'],
        plugins: ['transform-class-properties'],
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src',
          src: '**/*.js',
          dest: 'build/',
        }],
      },
    },
    browserify: {
      dist: {
        files: {
          'dist/gmusic-ui.js': ['build/gmusic-ui.js'],
        },
        options: {
          transform: [],
        },
      },
    },
    eslint: {
      options: {
        configFile: '.eslintrc',
      },
      src: ['src/*.js'],
    },
    uglify: {
      dist: {
        files: {
          'dist/gmusic-ui.min.js': ['dist/gmusic-ui.js'],
        },
      },
    },
    watch: {
      main: {
        files: ['src/**/*.js', 'lib/**/*'],
        tasks: ['build'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('gruntify-eslint');


  grunt.registerTask('test', ['eslint']);
  grunt.registerTask('build', ['eslint', 'babel', 'browserify', 'uglify']);
};
