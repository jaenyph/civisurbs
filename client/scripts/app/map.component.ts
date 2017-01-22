/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../lib/phaser/plugins/Isometric.d.ts" />

import { Component } from '@angular/core';

import 'phaser';
import 'phaser-plugin-saveCpu';
import 'phaser-plugin-isometric';

@Component({
    selector: 'cu-map',
    template: `<h1>Map : {{status}}</h1>`
})
export class MapComponent {
    status = 'loaded';

    private _game: Phaser.Game;
    private _isoGroup: any;
    private _cursorPos: any;

    constructor() {
        this._game = new Phaser.Game(
            640,
            480,
            Phaser.AUTO,
            '',
            null,
            false,
            false,
            false);

        this._game.state.add(
            'boot',
            {
                preload: this.gamePreload.bind(this),
                create: this.gameCreate.bind(this),
                update: this.gameUpdate.bind(this),
                render: this.gameRender.bind(this)
            },
            false);
        this._game.state.start('boot');
    }

    private gamePreload() {
        const game = this._game;

        const saveCpu = game.plugins.add(Phaser.Plugin.SaveCPU) as Phaser.Plugin.SaveCPU;
        saveCpu.renderOnFPS = 9;
        saveCpu.renderOnPointerChange = false;


        game.load.image('tile', './assets/tile.png');

        game.time.advancedTiming = true;

        // Add and enable the plug-in.
        game.plugins.add(new Phaser.Plugin.Isometric(game) as any);

        // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        game['iso'].anchor.setTo(0.5, 0.2);
    }

    private gameCreate() {
        // Create a group for our tiles.
        this._isoGroup = this._game.add.group();

        // Let's make a load of tiles on a grid.
        this.spawnTiles();

        // Provide a 3D position for the cursor
        this._cursorPos = new Phaser.Plugin.Isometric.Point3();
    }

    private gameRender() {
        const game = this._game;
        game.debug.text('Move your mouse around!', 2, 36, '#ffffff');
        game.debug.text(game.time.fps as any || '--', 2, 14, '#a7aebe');
    }

    private gameUpdate() {
        const game = this._game;
        // Update the cursor position.
        // It's important to understand that screen-to-isometric projection means
        // you have to specify a z position manually, as this cannot be easily
        // determined from the 2D pointer position without extra trickery.
        // By default, the z position is 0 if not set.
        game['iso'].unproject(game.input.activePointer.position, this._cursorPos);

        // Loop through all tiles and test to see if the 3D position from above
        // intersects with the automatically generated IsoSprite tile bounds.
        this._isoGroup.forEach((tile: any) => {
            const inBounds = tile.isoBounds.containsXY(this._cursorPos.x, this._cursorPos.y);
            // If it does, do a little animation and tint change.
            if (!tile.selected && inBounds) {
                tile.selected = true;
                tile.tint = 0x86bfda;
                game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
            }
            // If not, revert back to how it was.
            else if (tile.selected && !inBounds) {
                tile.selected = false;
                tile.tint = 0xffffff;
                game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
            }
        });
    }


    spawnTiles() {
        let tile;
        for (let xx = 0; xx < 256; xx += 38) {
            for (let yy = 0; yy < 256; yy += 38) {
                // Create a tile using the new game.add.isoSprite factory method at the specified position.
                // The last parameter is the group you want to add it to (just like game.add.sprite)
                tile = this._game.add['isoSprite'](xx, yy, 0, 'tile', 0, this._isoGroup);
                tile.anchor.set(0.5, 0);
            }
        }
    }
}
