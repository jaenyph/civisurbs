/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../../../node_modules/phaser/typescript/pixi.d.ts" />
/// <reference path="../../../node_modules/phaser/typescript/pixi.comments.d.ts" />

import { Component } from '@angular/core';

import 'phaser';

@Component({
    selector: 'cu-map',
    template: `<h1>Map : {{_game.resolution}}</h1>`
})
export class MapComponent {
    status = 'loaded';
    private _game: Phaser.Game;

    constructor() {
        let game: Phaser.Game;

        function preload() {
            game.add.text(100, 100, 'It works', { fill: 'green' });
            // game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
            // game.scale.parentIsWindow = true;
        }

        function create() {
        }

        function update() {
        }

        game = new Phaser.Game(640, 480, Phaser.AUTO, '', { preload: preload, create: create, update: update });

        this._game = game;
    }
}
