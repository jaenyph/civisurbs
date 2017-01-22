/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../../../node_modules/phaser/typescript/pixi.d.ts" />
/// <reference path="../../../node_modules/phaser/typescript/pixi.comments.d.ts" />

import { Component } from '@angular/core';

import 'phaser';
import 'phaser-plugin-saveCpu';

@Component({
    selector: 'cu-map',
    template: `<h1>Map : {{_game.resolution}}</h1>`
})
export class MapComponent {
    status = 'loaded';
    private _game: Phaser.Game;
    private _saveCpu: Phaser.Plugin.SaveCPU;

    constructor() {
        let game: Phaser.Game;

        function init() {
            this.game.saveCPU = this._saveCpu = this.game.plugins.add(Phaser.Plugin.SaveCPU) as Phaser.Plugin.SaveCPU;
            this._saveCpu.renderOnFPS = 9;
            this._saveCpu.renderOnPointerChange = false;
        }

        function preload() {
            game.add.text(100, 100, 'It works', { fill: 'green' });
        }

        function create() {
        }

        function update() {
        }

        game = new Phaser.Game(
            640,
            480,
            Phaser.AUTO,
            '',
            {
                init: init,
                preload: preload,
                create: create,
                update: update
            });

        this._game = game;
    }
}
