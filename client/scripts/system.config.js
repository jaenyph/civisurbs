/**
 * System configuration for Civis Urbs
 */
(function (global) {
  System.config({
    paths: {
      // paths serve as alias
      'libs:': 'scripts/lib/'
    },
    // map tells the System loader where to look for things
    map: {
      // our app is within the app folder
      app: 'scripts/app',

      // angular bundles
      '@angular/core': 'libs:angular/core.umd.min.js',
      '@angular/common': 'libs:angular/common.umd.min.js',
      '@angular/compiler': 'libs:angular/compiler.umd.min.js',
      '@angular/platform-browser': 'libs:angular/platform-browser.umd.min.js',
      '@angular/platform-browser-dynamic': 'libs:angular/platform-browser-dynamic.umd.min.js',
      '@angular/http': 'libs:angular/http.umd.min.js',
      '@angular/router': 'libs:angular/router.umd.min.js',
      '@angular/forms': 'libs:angular/forms.umd.min.js',

      // other libraries
      'rxjs':                      'libs:rxjs',
      'angular-in-memory-web-api': 'libs:angular-in-memory-web-api/in-memory-web-api.umd.min.js',
      'phaser' : 'libs:phaser/phaser.min.js',
      'phaser-p2' : 'libs:phaser/p2.min.js',
      'phaser-pixi' : 'libs:phaser/pixi.min.js'
    },
    // packages tells the System loader how to load when no filename and/or no extension
    packages: {
      app: {
        main: './main.js',
        defaultExtension: 'js'
      },
      rxjs: {
        defaultExtension: 'js'
      },
      phaser: {
        defaultExtension: 'js'
      }
    },
    shim:{
      'phaser':{
        exports:'Phaser'
      }
    }
  });
})(this);
