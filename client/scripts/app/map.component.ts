/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts" />
/// <reference path="../lib/phaser/plugins/Isometric.d.ts" />

import { Component, ElementRef, OnInit } from '@angular/core';

import 'phaser';
import 'phaser-plugin-saveCpu';
import 'phaser-plugin-isometric';

@Component({
    selector: 'cu-map',
    template: ``
})
export class MapComponent {
    private _game: Phaser.Game;
    private _isoGroup: any;
    private _cursorPos: Phaser.Plugin.Isometric.Point3;
    private _inputCursorKeys: Phaser.CursorKeys;
    private _isPanning: boolean;
    private _panningStartPosition: Phaser.Point;
    private _isometric: Phaser.Plugin.Isometric.Projector;

    constructor(private _element: ElementRef) {

        this._isPanning = false;
        this._panningStartPosition = new Phaser.Point(0, 0);
    }

    ngOnInit() {
        const element = this._element.nativeElement;
        element.innerHTML = '';
        const elementBox = element.parentNode.getBoundingClientRect();
        this._game = new Phaser.Game(
            elementBox.width,
            elementBox.height,
            Phaser.AUTO,
            element,
            null,
            false,
            false,
            false);

        window.addEventListener('resize', this.processViewportResize.bind(this));

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

        const game = this._game;
        game.world.setBounds(0, 0, 1920, 1920);
        this._inputCursorKeys = game.input.keyboard.createCursorKeys();

        this._element.nativeElement.addEventListener('contextmenu', () => false);
        if (game.canvas) {
            game.canvas.oncontextmenu = () => false;
        }

        this.initializePanningEvents();


        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        // This is necessary to scale before waiting for window changes.
        game.scale.refresh();

        game.input.onDown.addOnce(() => {
            this._game.scale.startFullScreen(false);
        }, this);

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

    private initializePanningEvents() {

        const game = this._game;

        // This will be defined on a TOUCH device such as iPad or Android, etc.
        const is_touch_device = 'ontouchstart' in document.documentElement;

        if (is_touch_device) {
            // create a drawer which tracks touch movements
            const drawer = {
                isDrawing: false,
                touchstart: (coors: any) => {
                    this._isPanning = true;
                    this._panningStartPosition = new Phaser.Point(coors.x, coors.y);
                },
                touchmove: (coors: any) => {
                    if (this._isPanning) {
                        this.processPanning(game, this._panningStartPosition, new Phaser.Point(coors.x, coors.y));
                    }
                },
                touchend: (coors: any) => {
                    if (this._isPanning) {
                        drawer.touchmove(coors);
                        this._isPanning = false;
                    }
                }
            };


            // create a function to pass touch events and coordinates to drawer
            const draw = (event: any) => {
                // get the touch coordinates.  Using the first touch in case of multi-touch
                const coors = {
                    x: event.targetTouches[0].pageX,
                    y: event.targetTouches[0].pageY
                };

                // Now we need to get the offset of the canvas location
                let obj: any = this._game.canvas;

                if (obj.offsetParent) {
                    // Every time we find a new object, we add its offsetLeft and offsetTop to curleft and curtop.
                    do {
                        coors.x -= obj.offsetLeft;
                        coors.y -= obj.offsetTop;
                    }
                    // The while loop can be "while (obj = obj.offsetParent)" only, which does return null
                    // when null is passed back, but that creates a warning in some editors (i.e. VS2010).
                    while ((obj = obj.offsetParent) != null);
                }

                // pass the coordinates to the appropriate handler
                drawer[event.type](coors);
            };


            // attach the touchstart, touchmove, touchend event listeners.
            const canvas = game.canvas;
            canvas.addEventListener('touchstart', draw, false);
            canvas.addEventListener('touchmove', draw, false);
            canvas.addEventListener('touchend', draw, false);

            // prevent elastic scrolling
            canvas.addEventListener('touchmove', function (event) {
                event.preventDefault();
            }, false);
        } else {

            // start drawing when the mousedown event fires, and attach handlers to
            // draw a line to wherever the mouse moves to
            game.canvas.addEventListener('mousedown', (mouseEvent) => {

                const updatePosition = (nativeEvent: MouseEvent, canvas: HTMLCanvasElement, pointToUpdate?: Phaser.Point): Phaser.Point => {
                    const result = pointToUpdate || new Phaser.Point();
                    let x, y;
                    if (nativeEvent.pageX !== undefined && nativeEvent.pageY !== undefined) {
                        x = nativeEvent.pageX;
                        y = nativeEvent.pageY;
                    } else {
                        x = nativeEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                        y = nativeEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                    }

                    return result.set(x - canvas.offsetLeft, y - canvas.offsetTop);
                };

                const canvas = mouseEvent.target as HTMLCanvasElement;


                let onMouseMove: (nativeEvent: MouseEvent) => void;
                let onMouseUp: (nativeEvent: MouseEvent) => void;
                let onMouseOut: (nativeEvent: MouseEvent) => void;

                const terminatePanning = () => {
                    canvas.removeEventListener('mousemove', onMouseMove, false);
                    canvas.removeEventListener('mouseup', onMouseUp, false);
                    canvas.removeEventListener('mouseout', onMouseOut, false);
                    this._isPanning = false;
                };

                onMouseMove = (nativeEvent: MouseEvent) => {
                    if (this._isPanning) {
                        this.processPanning(game, this._panningStartPosition, updatePosition(nativeEvent, canvas));
                    }
                };
                onMouseUp = (nativeEvent: MouseEvent) => {
                    terminatePanning();
                };
                onMouseOut = (nativeEvent: MouseEvent) => {
                    this._isPanning = false;
                    terminatePanning();
                };

                canvas.addEventListener('mousemove', onMouseMove, false);
                canvas.addEventListener('mouseup', onMouseUp, false);
                canvas.addEventListener('mouseout', onMouseOut, false);

                updatePosition(mouseEvent, game.canvas, this._panningStartPosition);
                this._isPanning = true;

            }, false);

        }
    }

    private processPanning(game: Phaser.Game, pointerInitialPosition: Phaser.Point, pointerCurrentPosition: Phaser.Point): void {
        const panningSpeedReducer = 0.077;
        const deltaPosition = pointerCurrentPosition.subtract(pointerInitialPosition.x, pointerInitialPosition.y);
        const newCameraPosition = new Phaser.Point(game.camera.x, game.camera.y)
            .add(deltaPosition.x * panningSpeedReducer, deltaPosition.y * panningSpeedReducer);
        game.camera.x = newCameraPosition.x;
        game.camera.y = newCameraPosition.y;
    }

    private processViewportResize() {
        this._game.scale.setGameSize(window.innerWidth, window.innerHeight);
    }

    private spawnTiles() {
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
