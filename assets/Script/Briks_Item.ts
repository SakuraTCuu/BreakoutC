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
        this.node['data'] = data;
        if (data.isSoild) {
            this.sp.spriteFrame = this.spf1;
        } else {
            this.sp.spriteFrame = this.spf2;
        }
        // this.node.color = data.color;
        this.node.position = data.pos;
        this.node.setContentSize(data.size);
        // let lab = this.addComponent(cc.Label);
        // lab.string = this.node.name;
        // lab.fontSize = 20;
        // this.node.color = new cc.Color(1, 1, 1, 255);
        
        // this.getComponent(cc.BoxCollider).size = data.size;
        // this.getComponent(cc.BoxCollider).offset = cc.v2(data.size.width / 2, data.size.height / 2);
    }

    update(dt) {
        if (this.node['data'].isDestroyed) {
            this.node.destroy();
        }
    }
}
