import { bkInfo } from "./GameLevel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Briks_Item extends cc.Component {

    @property(cc.SpriteFrame)
    spf1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    spf2: cc.SpriteFrame = null;

    @property(cc.Sprite)
    sp: cc.Sprite = null;

    onLoad() {

    }

    init(data: bkInfo) {
        if (data.isSoild) {
            this.sp.spriteFrame = this.spf1;
        } else {
            this.sp.spriteFrame = this.spf2;
        }
        // this.node.color = data.color;
        this.node.setContentSize(data.size);
        this.node.position = data.pos;
    }
}
