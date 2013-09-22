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

    jshint: {
      jshintrc: '.jshintrc',
      all: [
        'Gruntfile.js',
        'source/**/*.js',
        '!source/vendor/**/*.js',
        'test/**/*.js'
      ]
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
};
