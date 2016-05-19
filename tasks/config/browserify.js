/**
 * Run Browserify and Babelify.
 *
 * ---------------------------------------------------------------
 *
 */
module.exports = function(grunt) {

  grunt.config.set('browserify', {
    options: {
      transform: [["babelify", { "presets": ["es2015", "react"] }]]
    },
    client: {
      src: ['views/**/*.js', 'views/**/*.jsx'],
      dest: 'assets/js/bundle.js'
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
};
