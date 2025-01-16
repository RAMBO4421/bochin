'use strict';

var gulp = require('gulp');
var nav = require('./../src/nav');
var build = require('./build');
var func = require('./compile');
var menu = func.fillProperties({
    groups: nav.lists,
    seedOnly: build.config.compile.seedOnly,
});

menu.forEach(function(item, index) {
    if (item.items) {
        for (const itemElement of item.items) {
            itemElement.href += '?v=' + new Date().getTime();
        }
    } else
        item.href += '?v=' + new Date().getTime();
});

// push nav objects
gulp.task('build-nav', function(done) {
    console.log('==================> Generating nav.hbs...');
    func.writeNavigation(menu, build.config.path.exportPath);
    func.formatOutput({
        inputPath: build.config.path.exportPath,
        outputPath: build.config.path.outputPath,
    });
    done();
});