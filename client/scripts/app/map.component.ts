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
    private _cursorPos: Phaser.Plugin.Isometric.Point3;
    private _cursorKeys: Phaser.CursorKeys;
    private _isometric: Phaser.Plugin.Isometric.Projector;

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

        game.load.atlasXML('landscape', './assets/landscape/landscapeTiles_sheet.png', './assets/landscape/landscapeTiles_sheet.xml');

        game.time.advancedTiming = true;

        // Add and enable the plug-in.
        game.plugins.add(new Phaser.Plugin.Isometric(game) as any);

        this._isometric = this._game['iso'];

        // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        this._isometric.anchor.setTo(0.5, 0.1);
    }

    private gameCreate() {

        this._cursorKeys = this._game.input.keyboard.createCursorKeys();
        const game = this._game;
        game.world.setBounds(0, 0, 1920, 1920);

        // Create a group for our tiles.
        this._isoGroup = this._game.add.group();

        // we won't really be using IsoArcade physics, but I've enabled it anyway so the debug bodies can be seen
        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);
        this._isoGroup.enableBody = true;
        this._isoGroup.physicsBodyType = Phaser.Plugin.Isometric.ISOARCADE;

        // Let's make a load of tiles on a grid.
        this.spawnTiles();

        // Provide a 3D position for the cursor
        this._cursorPos = new Phaser.Plugin.Isometric.Point3();
    }

    private gameRender() {
        const game = this._game;
        const c = this._cursorPos;
        game.debug.text(`Move your mouse around! (${c.x},${c.y})`, 2, 36, '#ffffff');
        game.debug.text(game.time.fps as any || '--', 2, 14, '#a7aebe');
    }

    private gameUpdate() {
        const game = this._game;
        // Update the cursor position.
        // It's important to understand that screen-to-isometric projection means
        // you have to specify a z position manually, as this cannot be easily
        // determined from the 2D pointer position without extra trickery.
        // By default, the z position is 0 if not set.
        this._isometric.unproject(game.input.activePointer.position, this._cursorPos);

        // Loop through all tiles and test to see if the 3D position from above
        // intersects with the automatically generated IsoSprite tile bounds.
        this._isoGroup.forEach((tile: Phaser.Plugin.Isometric.IsoSprite) => {
            const inBounds = tile.isoBounds['containsXY'](this._cursorPos.x, this._cursorPos.y);
            const meta = tile['meta'] || (tile['meta'] = {});
            if (!meta.selected && inBounds) {
                // If it does, do a little animation and tint change.
                tile['meta'].selected = true;
                tile.tint = 0x86bfda;
            } else if (meta.selected && !inBounds) {
                // If not, revert back to how it was.
                meta.selected = false;
                tile.tint = 0xffffff;
            }
        });

        const cursors = this._inputCursorKeys;
        if (cursors.up.isDown) {
            game.camera.y -= 4;
        } else if (cursors.down.isDown) {
            game.camera.y += 4;
        }

        if (cursors.left.isDown) {
            game.camera.x -= 4;
        } else if (cursors.right.isDown) {
            game.camera.x += 4;
        }
    }


    spawnTiles() {
        const tiles = [
            73, 73, 73, 73, 73, 73, 73, 73, 73, 73, 73,
            73, 123, 74, 74, 74, 74, 74, 74, 74, 126, 73,
            73, 82, 21, 29, 67, 67, 67, 67, 67, 82, 73,
            73, 82, 28, 36, 67, 67, 67, 67, 67, 82, 73,
            73, 82, 67, 67, 67, 67, 55, 63, 67, 82, 73,
            73, 82, 67, 67, 67, 67, 62, 70, 67, 82, 73,
            73, 82, 67, 67, 67, 67, 67, 67, 67, 82, 73,
            73, 82, 67, 67, 67, 67, 67, 67, 67, 82, 73,
            73, 82, 67, 67, 67, 67, 67, 67, 67, 82, 73,
            73, 125, 74, 74, 74, 74, 74, 74, 74, 127, 73,
            73, 73, 73, 73, 73, 73, 73, 73, 73, 73, 73
        ];

        const mapTilesWidth = 11, mapTilesHeight = 11;
        const game = this._game;

        const tileIsoWidth = 71, tileIsoHeight = 71;
        const mapIsoWidth = mapTilesWidth * tileIsoWidth;
        const mapIsoHeight = mapTilesHeight * tileIsoHeight;
        let tile;
        for (let x = 0, isoX = 0; isoX < mapIsoWidth; isoX += tileIsoWidth, ++x) {
            for (let y = 0, isoY = 0; isoY < mapIsoHeight; isoY += tileIsoHeight, ++y) {

                const tileIndex = (y * mapTilesWidth) + x;
                const frameIndex = tiles[tileIndex];
                let isoZ = 0;
                switch (frameIndex) {
                    case 36:
                        isoZ += 32;
                        break;
                    case 70:
                        isoZ -= 16;
                        break;
                }
                tile = game.add['isoSprite'](isoX, isoY, isoZ, 'landscape', frameIndex, this._isoGroup);
                tile.anchor.set(0.5, 0);
                tile.smoothed = false;
                tile.body.moves = false;
            }
        }
    }
}
