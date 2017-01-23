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

        game.load.atlasJSONHash('tileset', './assets/roadTiles/atlas.png', 'assets/roadTiles/atlas.json');


        game.time.advancedTiming = true;

        // Add and enable the plug-in.
        game.plugins.add(new Phaser.Plugin.Isometric(game) as any);

        // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        game['iso'].anchor.setTo(0.5, 0.1);
    }

    private gameCreate() {
        // Create a group for our tiles.
        this._isoGroup = this._game.add.group();

        // we won't really be using IsoArcade physics, but I've enabled it anyway so the debug bodies can be seen
        this._game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        this._isoGroup.enableBody = true;
        this._isoGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;

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

        const frames = this._game.cache.getFrameData('tileset').getFrames();
        const tiles = [
            9, 2, 1, 1, 4, 4, 1, 6, 2, 10, 2,
            2, 6, 1, 0, 4, 4, 0, 0, 2, 2, 2,
            6, 1, 0, 0, 4, 4, 0, 0, 8, 8, 2,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 9, 2,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0,
            11, 11, 12, 11, 3, 3, 11, 12, 11, 11, 11,
            3, 7, 3, 3, 3, 3, 3, 3, 7, 3, 3,
            7, 1, 7, 7, 3, 3, 7, 7, 1, 1, 7
        ];

        const mapTilesWidth = 11, mapTilesHeight = 11;
        let maxFrameWidth: number, maxFrameHeight: number, maxFrameCenterY:number;
        const game = this._game;
        let x = 0, y = 0;
        for (let tileY = 0; tileY < mapTilesHeight; ++tileY) {
            x = 0;
            maxFrameWidth = 0;
            maxFrameHeight = 0;
            maxFrameCenterY = 0;
            for (let tileX = 0; tileX < mapTilesWidth; ++tileX, ++x) {
                const tileIndex = (tileY * mapTilesWidth) + tileX;
                const frameIndex = tiles[tileIndex];
                const frame = frames[frameIndex];
                let tile = game.add['isoSprite'](
                    x,
                    y,
                    0,
                    'tileset',
                    frameIndex,
                    this._isoGroup);

                if (frame.width > maxFrameWidth) {
                    maxFrameWidth = frame.width;
                }

                if (frame.height > maxFrameHeight) {
                    maxFrameHeight = frame.height;
                }

                if (frame.centerY > maxFrameCenterY) {
                    maxFrameCenterY = frame.centerY;
                }

                x += frame.width - (frame.centerX - 5);

                tile.anchor.set(0.5, 1);
                tile.smoothed = false;
                tile.body.moves = false;
            }
            y += maxFrameHeight - (maxFrameCenterY - 5);
        }
    }
}
