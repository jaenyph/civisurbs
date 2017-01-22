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

        // tslint:disable-next-line:quotemark
        console.info("Phaser", Phaser);
        this._game = new Phaser.Game(640, 480, Phaser.AUTO);
        console.info("game", this._game);
        this._game.resolution

    }
}
