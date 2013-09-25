var mountFolder = function(connect, dir){
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt){

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      all: {
        files: [{
          dot: true,
          src: [ './.tmp', './dist' ]
        }]
      }
    },

    watch: {
      options: {
        nospawn: true,
        livereload: true
      },

      html: {
        files: [ './.tmp/**/*.html', './source/**/*.html', '!./source/vendor/**/*.html' ]
      },

      css: {
        files: [ './.tmp/css/**/*.css', './source/css/**/*.css' ]
      },

      js: {
        files: [ './.tmp/js/**/*.js', './source/js/**/*.js' ],
        tasks: [ 'jshint:all' ]
      },
    },

    jshint: {
      jshintrc: '.jshintrc',
      all: [
        'Gruntfile.js',
        'source/**/*.js',
        '!source/vendor/**/*.js',
        'test/**/*.js'
      ]
    },

    // Set up the karma test runner.
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        runnerPort: 9999,
        singleRun: true,
        browsers: ['PhantomJS']
      },

      watch: {
        configFile: 'karma.conf.js',
        runnerPort: 9999,
        singleRun: false
      }
    },

    // Connect server to serve up local files.
    connect: {
      options: {
        port: 9000,
        // Using 0.0.0.0 allows access from outside
        hostname: '0.0.0.0'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              require('connect-livereload')(),
              mountFolder(connect, './.tmp/'),
              mountFolder(connect, './source/')
            ];
          }
        }
      }
    },

    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>/'
      }
    }
  });

  // load the plugins used by grunt
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-karma');


  // use grunt.registerTask() to register custom tasks
  grunt.registerTask('server', ['jshint:all', 'connect:livereload', 'open:server', 'watch']);
  grunt.registerTask('default', ['jshint:all', 'karma:watch']);
  grunt.registerTask('test:once', ['jshint:all', 'karma:unit']);
  grunt.registerTask('test:ci', ['jshint:all', 'karma:watch']);
};
