import {Graphics} from '@antha/graphics-2d';
import {defineEntity} from '../mods/asteroids-entity.mod.js';

const playerSize = 24;

export class PlayerEntity extends defineEntity({
    assets: {
        player: {
            maxProgress: 1,
            load({incrementProgressCallback}) {
                const graphics = new Graphics()
                    .moveTo(0, -playerSize)
                    .lineTo(playerSize * 0.8, playerSize)
                    .lineTo(0, playerSize * 0.55)
                    .lineTo(-playerSize * 0.8, playerSize)
                    .closePath()
                    .fill('#39ff14');

                incrementProgressCallback();

                return {
                    value: graphics,
                };
            },
        },
    },
    key: 'asteroids-player',
}) {
    public override async createView() {
        const view = await this.getAsset.player();

        view.x = this.pixi.screen.width / 2;
        view.y = this.pixi.screen.height / 2;

        return {
            view,
        };
    }

    public override update() {
        this.view.x = this.pixi.screen.width / 2;
        this.view.y = this.pixi.screen.height / 2;
    }
}
