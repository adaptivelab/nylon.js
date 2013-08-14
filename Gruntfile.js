module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            all: ['Gruntfile.js', 'src/nylon.js']
        },
        jasmine: {
            pivotal: {
                src: 'src/**/*.js',
                options: {
                    specs: 'spec/**/*_spec.js',
                    helpers: 'spec/**/*_helper.js'
                }
            }
        },
        uglify: {
            build: {
                files: {
                    'dist/nylon.min.js': 'src/nylon.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', ['jshint']);
    grunt.registerTask('build', ['jshint', 'uglify']);

};