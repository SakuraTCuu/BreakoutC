import GameLevel, { bkInfo } from "./GameLevel";
import Briks_Item from "./Briks_Item";

const { ccclass, property } = cc._decorator;

// Represents the current state of the game
enum GameState {
    GAME_ACTIVE,
    GAME_MENU,
    GAME_WIN
};

enum Direction {
    UP,
    RIGHT,
    DOWN,
    LEFT
};

@ccclass
export default class GameManager extends cc.Component {


    @property(cc.Node)
    ballNode: cc.Node = null;

    @property(cc.Node)
    playerNode: cc.Node = null;

    @property(cc.Node)
    rootNode: cc.Node = null;

    //球的初始速度
    INITIAL_BALL_VELOCITY: cc.Vec2 = cc.v2(300, 500);
    // Initial velocity of the playerNode paddle
    PLAYER_VELOCITY: number = 100;
    // 球的半径
    BALL_RADIUS: number = 20;
    State: GameState = GameState.GAME_ACTIVE;

    Stuck: boolean = true;

    Velocity: cc.Vec2 = cc.v2(150, 400);

    nwidth: number = 0;
    nheight: number = 0;

    playerPos: cc.Vec2 = cc.v2();
    ballPos: cc.Vec2 = cc.v2();

    Levels: Array<GameLevel> = [];

    currentLevel: number = 0;

    onLoad() {
        // cc.game.setFrameRate(48);
        this.nwidth = this.node.width / 2;
        this.nheight = this.node.height / 2;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event) {
        let key = event.keyCode;
        if (this.State == GameState.GAME_ACTIVE) {
            let velocity = this.PLAYER_VELOCITY;
            // 移动挡板
            if (key === cc.macro.KEY.a) {
                if (this.playerNode.x >= this.playerNode.width / 2 - this.node.width / 2) {
                    this.playerNode.x -= velocity;
                    if (this.Stuck) {
                        this.ballNode.x -= velocity;
                    }
                }
            }
            if (key === cc.macro.KEY.d) {
                if (this.playerNode.x <= this.node.width / 2 - this.playerNode.width / 2) {
                    this.playerNode.x += velocity;
                    if (this.Stuck) {
                        this.ballNode.x += velocity;
                    }
                }
            }

            if (key === cc.macro.KEY.space) {
                this.Stuck = !this.Stuck;
            }
        }
    }

    update(dt) {
        if (!this.Stuck) {
            // dt = 0.017;
            // 移动球
            this.ballNode.x += this.Velocity.x * dt;
            this.ballNode.y += this.Velocity.y * dt;
            // this.ballNode.position = cc.v2(this.ballNode.x += this.Velocity.x * dt, this.ballNode.y += this.Velocity.y * dt);

            let x = this.ballNode.x;
            let y = this.ballNode.y;
            let bwidth = this.ballNode.width / 2;
            let bheight = this.ballNode.height / 2;


            if (x <= bwidth - this.nwidth) {
                this.Velocity.x = -this.Velocity.x;
                x = bwidth - this.nwidth;
            } else if (x >= this.nwidth - bwidth) {
                this.Velocity.x = -this.Velocity.x;
                x = this.nwidth - bwidth;
            }
            if (y >= this.nheight - bheight) {
                this.Velocity.y = -this.Velocity.y;
                y = this.nheight - bheight;
            }
            else if (y <= bheight - this.nheight) {
                this.Velocity.y = -this.Velocity.y;
                y = bheight - this.nheight;
            }
            this.ballNode.position = cc.v2(x, y);

            // 检测碰撞
            this.DoCollisions();

            // 球是否接触底部边界？
            if (this.ballNode.y < -this.node.height / 2) {
                cc.log("游戏结束");
                // this.ResetLevel();
                // this.ResetPlayer();
            }
        }
    }
    //检测碰撞
    DoCollisions() {
        let len = this.rootNode.childrenCount;
        for (let i = 0; i < len; i++) {
            let item = this.rootNode.children[i];
            let data = item['data'] as bkInfo;
            if (!data.isDestroyed) {
                let collision = this.CheckCollision(this.ballNode, item);
                if (collision['state']) {
                    if (!data.isSoild) {
                        data.isDestroyed = true;
                    }
                    let dir = collision['direction'];
                    let diff_vector = collision['diffPos'];
                    if (dir == Direction.LEFT || dir == Direction.RIGHT) {
                        // this.Velocity = this.Velocity.neg();
                        this.Velocity.x = -this.Velocity.x;
                        let penetration = this.BALL_RADIUS - Math.abs(diff_vector.x);
                        //重定位
                        if (dir == Direction.LEFT) {
                            this.ballNode.x += penetration;
                        } else {
                            this.ballNode.x -= penetration;
                        }
                    } else {
                        // this.Velocity = this.Velocity.neg();
                        this.Velocity.y = -this.Velocity.y;
                        let penetration = this.BALL_RADIUS - Math.abs(diff_vector.x);
                        //重定位
                        if (dir == Direction.UP) {
                            this.ballNode.y -= penetration;
                        } else {
                            this.ballNode.y += penetration;
                        }
                    }
                }
            }
        }

        //检测玩家与球的碰撞
        let result = this.CheckCollision(this.ballNode, this.playerNode);
        if (!this.Stuck && result['state']) {
            // 检查碰到了挡板的哪个位置，并根据碰到哪个位置来改变速度
            let distance = this.ballNode.x - this.playerNode.x;
            let percentage = distance / (this.playerNode.width / 2);

            let strength = 2;
            let oldVelocity = cc.v2(this.Velocity.x, this.Velocity.y);
            // this.Velocity.x = this.INITIAL_BALL_VELOCITY.x * percentage * strength;
            //	Ball->Velocity.y = -Ball->Velocity.y;  //解决粘板问题
            this.Velocity.x = this.INITIAL_BALL_VELOCITY.x * percentage * strength;
            // this.Velocity.x += this.Velocity.x * Math.abs(percentage) * strength;

            this.Velocity.y = Math.abs(this.Velocity.y);
            let normalVec = this.Velocity.normalizeSelf();
            this.Velocity = cc.v2(normalVec.x * oldVelocity.mag(), normalVec.y * oldVelocity.mag());
        }
    }

    CheckCollision(one: cc.Node, two: cc.Node) {
        // //矩形 AABB碰撞框
        // // x轴方向碰撞？
        // let collisionX: Boolean = one.position.x + one.Size.x >= two.position.x && two.position.x + two.Size.x >= one.position.x;
        // // y轴方向碰撞？
        // let collisionY: Boolean = one.position.y + one.Size.y >= two.position.y && two.position.y + two.Size.y >= one.position.y;
        // // 只有两个轴向都有碰撞时才碰撞
        // return collisionX && collisionY;

        let localBallPos = one.position;
        if (two !== this.playerNode) {
            //将世界节点转换为本地节点
            let worldPos = this.node.convertToWorldSpaceAR(one.position);
            localBallPos = this.rootNode.convertToNodeSpaceAR(worldPos);
        }

        let center = localBallPos;
        // 获取圆的中心 
        // 计算AABB的信息（中心、半边长）
        let aabb_half_extents: cc.Vec2 = cc.v2(two.width / 2, two.height / 2);
        let aabb_center = two.position;
        // 获取两个中心的差矢量
        let difference: cc.Vec2 = center.sub(aabb_center);
        let aabb_half_extents_neg = cc.v2(-aabb_half_extents.x, -aabb_half_extents.y);
        let clamped: cc.Vec2 = difference.clampf(aabb_half_extents_neg, aabb_half_extents);
        // AABB_center加上clamped这样就得到了碰撞箱上距离圆最近的点closest
        let closest: cc.Vec2 = aabb_center.add(clamped);
        // 获得圆心center和最近点closest的矢量并判断是否 length <= radius
        difference = closest.sub(center);
        if (difference.mag() < this.BALL_RADIUS) {
            return {
                state: true,
                direction: this.VectorDirection(difference),
                diffPos: difference
            };
        } else {
            return {
                state: false,
                direction: Direction.UP,
                diffPos: cc.v2(0, 0)
            };
        }
    }

    /**
 //  * 当碰撞产生的时候调用
 //  * @param  {Collider} other 产生碰撞的另一个碰撞组件
 //  * @param  {Collider} self  产生碰撞的自身的碰撞组件
 //  */
    // onCollisionEnter(other, self) {

    // }


    VectorDirection(target: cc.Vec2): Direction {
        let compass: Array<cc.Vec2> = [
            cc.v2(0, 1),// 上
            cc.v2(1, 0),// 右
            cc.v2(0, -1),// 下
            cc.v2(-1, 0), // 左
        ]
        let max = 0;
        let best_match = -1;
        for (let i = 0; i < 4; i++) {
            let dot_product = target.normalizeSelf().dot(compass[i]);
            if (dot_product > max) {
                max = dot_product;
                best_match = i;
            }
        }
        return best_match as Direction;
    }

}
