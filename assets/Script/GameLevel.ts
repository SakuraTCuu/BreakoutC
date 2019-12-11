import Briks_Item from "./Briks_Item";

export interface bkInfo {
    pos: cc.Vec2;
    color: cc.Color;
    size: cc.Size;
    isSoild: boolean;
    isDestroyed: boolean;
}

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameLevel extends cc.Component {

    @property(cc.Prefab)
    itemPre: cc.Prefab = null;

    onLoad() {
        let width = this.node.width;
        let height = this.node.height;
        this.Load("levels/one", width, height);
        // this.Load("levels/two", width, height);
        // this.Load("levels/three", width, height);
        // this.Load("levels/four", width, height);
    }

    public bricks: Array<cc.Node> = new Array();

    public Load(file: string, width: number, height: number) {
        // 清空过期数据
        this.bricks.length = 0;

        let arr: Array<Array<number>> = [];
        let self = this;
        cc.loader.loadRes(file, function (err, file) {
            let data = file.text.split("\r");
            for (let i = 0; i < data.length; i++) {
                arr[i] = new Array();
                let row = data[i];
                let line = row.trim().split(" ");
                for (let j = 0; j < line.length; j++) {
                    let num = Number(line[j]);
                    arr[i][j] = num;
                }
            }
            if (arr.length > 0) {
                self.init(arr, width, height);
            }
        });
    }

    // 检查一个关卡是否已完成 (所有非坚硬的瓷砖均被摧毁)
    public IsComplete() {
        let flag: boolean = true;
        for (let i = 0; i < this.bricks.length; i++) {
            let item = this.bricks[i];
            if (item['bkData'].isSoild) {
                flag = false;
            }
        }
        return flag;
    }

    private init(tileData: Array<Array<number>>, levelWidth: number, levelHeight: number) {
        // 计算每个维度的大小
        let height = tileData.length;
        let width = tileData[0].length;
        let unit_width = levelWidth / width;
        let unit_height = levelHeight / height;
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                let item = cc.instantiate(this.itemPre);
                let itemScript = item.getComponent(Briks_Item);
                let bkData: bkInfo;
                if (tileData[j][i] == 1) {
                    let pos = cc.v2(unit_width * i, -unit_height * j);
                    let size = cc.size(unit_width, unit_height);
                    let color = cc.Color.RED;
                    bkData = {
                        pos: pos,
                        color: color,
                        size: size,
                        isSoild: true,
                        isDestroyed: false
                    }
                    itemScript.init(bkData);
                    item.name = i + "*" + j;
                    this.bricks.push(item);
                    this.node.addChild(item);
                } else if (tileData[j][i] > 1) {
                    let color;
                    // if (tileData[j][i] == 2) {
                    //     color = cc.Color.GRAY;
                    // } else if (tileData[j][i] == 3) {
                    //     color = cc.Color.BLACK;
                    // } else if (tileData[j][i] == 4) {
                    //     color = cc.Color.GREEN;
                    // } else if (tileData[j][i] == 5) {
                    //     color = cc.Color.ORANGE;
                    // }
                    
                    let pos = cc.v2(unit_width * i, -unit_height * j);
                    let size = cc.size(unit_width, unit_height);
                    bkData = {
                        pos: pos,
                        color: color,
                        size: size,
                        isSoild: false,
                        isDestroyed: false
                    }
                    itemScript.init(bkData);
                    item.name = i + "*" + j;
                    this.bricks.push(item);
                    this.node.addChild(item);
                }
            }
        }
    }
}
