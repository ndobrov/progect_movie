'use strict';

window.GAME = (() => {
  const KeyCodes = {
    ESCAPE: 27,
    SPACE: 32,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
  };

  const GameFrame = {
    WIDTH: 500,
    HEIGHT: 250,
  }

  const GameObjectType = {
    PLAYER: 0,
    FIREBALL: 1,
    ENEMY: 2,
    BULLET: 3,
  };

  const ObjectState = {
    ACTIVE: 0,
    DISPOSED: 1,
  };

  const MovementDirection = {
    EMPTY: 0,
    LEFT: 1,
    RIGHT: 2,
    UP: 4,
    DOWN: 8,
  };

  const GameStatus = {
    CONTINUE: 0,
    WIN: 1,
    FAIL: 2,
    PAUSE: 3,
    INTRO: 4
  };

  const GameConst = {
    Fireball: {
      size: 30,
      getSpeed: (isLeftDirection) => isLeftDirection ? 3 : Math.random(0) * 10, // TODO [TASK 2.1]
    },
    Player: {
      speed: 2,
      width: 150,
      getHeight: (width) => width,
      getX: (width) => width / 3,
      getY: (height) => height - 140,
    },
    Enemy: {
      speed: 1,
      width: 100,
      height: 82,
      getX: (width) => width * 2 / 3,
      getY: (height) => height - 82,
    },
    Bullet: {
      size: 10,
      getSpeed: (isLeftDirection) => isLeftDirection ? Math.random(0) * 0.5 : 1, 
    },

  };

  const FLIPPED = '-reversed';

  const GameSpritesData = {
    [GameObjectType.PLAYER]: {
      width: 150,
      height: 150,
      url: 'https://interns.room4.team/test-task-v1/player.png',
    },
    [GameObjectType.PLAYER + FLIPPED]: {
      width: 120,
      height: 120,
      url: 'https://interns.room4.team/test-task-v1/player-reversed.png',
    },
    [GameObjectType.FIREBALL]: {
      width: 28,
      height: 14,
      url: 'https://interns.room4.team/test-task-v1/comet.png',
    },

    [GameObjectType.BULLET]: {
      width: 14,
      height: 14,
      url: 'https://cdn.icon-icons.com/icons2/3035/PNG/512/weather_snow_snowflake_winter_freeze_icon_189094.png'
    },

    [GameObjectType.ENEMY]: {
      width: 78,
      height: 82,
      url: 'https://interns.room4.team/test-task-v1/enemy.png',
    },
    [GameObjectType.ENEMY + FLIPPED]: {
      width: 78,
      height: 82,
      url: 'https://interns.room4.team/test-task-v1/enemy-reversed.png',
    },
  };

  const GAME_MESSAGES = {
    [GameStatus.WIN]: 'You win!\nYeah!',
    [GameStatus.FAIL]: 'You loose!',
    [GameStatus.PAUSE]: 'Game paused!\nPress Space to continue',
    [GameStatus.INTRO]: 'Welcome!\nPress Space to start the game',
  };

  /** @abstract */
  class AbstractGameObject {
    constructor({
      height,
      width,
      direction,
      speed,
      x,
      y,
      angle = 0
    }) {
      this.direction = direction;
      this.height = height;
      this.speed = speed;
      this.width = width;
      this.x = x;
      this.y = y;
      this.angle = angle;

      this.state = ObjectState.ACTIVE
      this.sprite = null;
      this.type = null;
    }

    _checkDirection(direction) {
      return this.direction & direction;
    }

    _setDirection(newDirection) {
      if (newDirection === MovementDirection.EMPTY) {
        this.direction = newDirection;
        return;
      }

      const directionAntagonistCodes = {
        1: 2,
        2: 1,
        4: 8,
        8: 4
      };

      this.direction = this.direction & ~directionAntagonistCodes[newDirection];
      this.direction = this.direction | newDirection;
    }

    /** @abstract */
    behave(gameState, timeFrame) {
      throw new Error('Method is not implemented');
    }
  }

  /** @abstract */
  class FireballsThrowerObject extends AbstractGameObject {
    _throwFireball(gameState) {
      const fireballWidth = GameConst.Fireball.size * 2;
      const fireballHeight = GameConst.Fireball.size;

      const fireballX = this._checkDirection(MovementDirection.RIGHT) ?
        this.x + this.width - fireballWidth / 2 :
        this.x - GameConst.Fireball.size - fireballWidth / 2;

      const fireballY = this.y + this.height / 2;

      const fireballObj = new FireballObject({
        direction: this.direction,
        speed: GameConst.Fireball.getSpeed(this._checkDirection(MovementDirection.LEFT)),
        width: fireballWidth,
        height: fireballHeight,
        x: fireballX,
        y: fireballY,
        angle: -20,
      });

      gameState.objects.push(fireballObj);
    }
  }

  class ShooterObject extends AbstractGameObject {
    _shot(gameState) {
      const bulletWidth = GameConst.Bullet.size;
      const bulletHeight = GameConst.Bullet.size;

      const bulletX = this._checkDirection(MovementDirection.RIGHT) ?
        this.x + this.width - bulletWidth / 2 :
        this.x - GameConst.Bullet.size - bulletWidth / 2;

      const bulletY = this.y + this.height / 2;

      const bulletObj = new BulletObject({
        direction: this.direction,
        speed: GameConst.Bullet.getSpeed(this._checkDirection(MovementDirection.LEFT)),
        width: bulletWidth,
        height: bulletHeight,
        x: bulletX,
        y: bulletY,
        angle: -20,
      });

      gameState.objects.push(bulletObj);
    }
  }

  class PlayerObject extends FireballsThrowerObject {
    constructor(args) {
      super(args);
      this.type = GameObjectType.PLAYER;
      this.sprite = GameSpritesData[GameObjectType.PLAYER];
    }

    /**
     * @param {Object} gameState
     * @param {number} timeframe
     */
    behave(gameState, timeframe) {
      // TODO [TASK 5.1]

      // TODO [TASK 1.1]
      // Math.min(Math.max(0, this.x), GameFrame.WIDTH - this.sprite.width)

      if (gameState.keysPressed.UP && this.y > 0) {
        this._setDirection(MovementDirection.UP);
        this.y -= this.speed * timeframe * 2;
      }

      if (!gameState.keysPressed.UP) {
        if (this.y < GameFrame.HEIGHT - this.height + 15) {
          this._setDirection(MovementDirection.DOWN);
          this.y += this.speed * timeframe / 3;
        }
      }

      // TODO [TASK 1.4]

      if (this.y < 0) {
        this.y = 0;
      }

      // TODO [TASK 1.2]
      if (this.x < GameFrame.WIDTH - GameSpritesData[GameObjectType.PLAYER].width) {
      if (gameState.keysPressed.RIGHT) {
        this._setDirection(MovementDirection.RIGHT);
        this.x += this.speed * timeframe * 2;
      }
    }
      if (this.x >= 0) {
      if (gameState.keysPressed.LEFT) {
        this._setDirection(MovementDirection.LEFT);
        this.x -= this.speed * timeframe * 2;
      }

    } 

      if (gameState.keysPressed.SHIFT) {
        gameState.keysPressed.SHIFT = false;
        this._throwFireball(gameState);
      }
    }
  }

  class EnemyObject extends ShooterObject {
    constructor(args) {
      super(args);
      this.type = GameObjectType.ENEMY;
      this.sprite = GameSpritesData[GameObjectType.ENEMY];
    }

    move(step = 10) {
      const maxX = GameFrame.WIDTH - this.width + 15;
      const minX = 0;

      const direction = this._checkDirection(MovementDirection.LEFT);
      
      if (this.x <= minX) {
        this._setDirection(MovementDirection.RIGHT);
      }

      if (this.x >= maxX) {
        this._setDirection(MovementDirection.LEFT)
      }

      if (direction === MovementDirection.LEFT) {
        this.x -= step;
      } else {
        this.x += step;
      }
    }

    

    /**
     * @param {Object} gameState
     * @param {number} timeframe
     */
    behave(gameState, timeframe) {
      // TODO [TASK 3.1]
         
      this.move();
         
      // TODO [TASK 3.2]
      
      if (timeframe === 1.5) {
        this._shot(gameState);
      }
         
      // TODO [TASK 5.2]
      
      // if (gameState) {
      
      // }

        // if (this.x + this.sprite.width >= fireballs.x &&
      //    this.x <= fireballs.x + GameSpritesData[GameObjectType.FIREBALL].width &&
      //    (this.y <=fireballs.y + GameSpritesData[GameObjectType.FIREBALL].height ||
      //     this.y + this.height >= fireballs.y + GameSpritesData[GameObjectType.FIREBALL].height)) {
      //           this.state = GameStatus.FAIL
      //   }
      
      const fireballs = gameState.objects.filter(object => object.type === GameObjectType.FIREBALL);
      // let[{x, y}] = fireballs;
      const enemyWidth = this.sprite.width;
      const enemyHeight = this.sprite.height;
      const fireballWidth = GameSpritesData[GameObjectType.FIREBALL].width;
      const fireballHeight = GameSpritesData[GameObjectType.FIREBALL].height;
       let x = this.x  
       let y = this.y
      const fenceHit = (x, y) => fireballs.filter(fireball => fireball.x +fireballWidth > x  && fireballs.x < x + enemyWidth && fireballs.y < y -enemyHeight && fireballs.y - fireballHeight > y)[0];
      console.log(fenceHit())
      // if(fenceHit){
      //   GameStatus = GameStatus.FAIL
      // console.log(GameStatus)

      
      // }
    }
  };

  class FireballObject extends AbstractGameObject {
    constructor(args) {
      super(args);
      this.type = GameObjectType.FIREBALL;
      this.sprite = GameSpritesData[GameObjectType.FIREBALL];
    }

    /**
     * TODO [TASK 2.2]
     * 
     * @param {Object} gameState
     * @param {number} timeframe
     */
    behave(gameState, timeframe) {
      // TODO [TASK 2.2]
      this.y += 0.2

      if (this._checkDirection(MovementDirection.LEFT)) {
        this.x -= this.speed * timeframe;
      }

      if (this._checkDirection(MovementDirection.RIGHT)) {
        this.x += this.speed * timeframe;
      }

      if (this.x < 0 || this.x > GameFrame.WIDTH) {
        this.state = ObjectState.DISPOSED;
      }
    }
  }

  class BulletObject extends AbstractGameObject {
    constructor(args) {
      super(args);
      this.type = GameObjectType.BULLET;
      this.sprite = GameSpritesData[GameObjectType.BULLET];
    }

    /**
     * @param {Object} gameState
     * @param {number} timeframe
     */

    behave(gameState, timeframe) {

      this.y += 0.1

      if (this._checkDirection(MovementDirection.LEFT)) {
        this.x -= this.speed * timeframe * 100;
      }

      if (this._checkDirection(MovementDirection.RIGHT)) {
        this.x += this.speed * timeframe * 100;
      }

      if (this.x < 0 || this.x > GameFrame.WIDTH) {
        this.state = ObjectState.DISPOSED;
      }
    }
  }

  const GAME_RULES = [
    /**
     * Player dies - game over.
     * @param {Object} gameState
     * @return {GameStatus}
     */
    (gameState) => {
      const player = gameState.objects.filter((object) => object.type === GameObjectType.PLAYER)[0];
      return player.state === ObjectState.DISPOSED ? GameStatus.FAIL : GameStatus.CONTINUE;
    },

    /**
     * Pressed ESC button can pause/resume the game
     * @param {Object} gameState
     * @return {GameStatus}
     */
    (gameState) => {
      return gameState.keysPressed.ESC ? GameStatus.PAUSE : GameStatus.CONTINUE;
    },

    /**
     * TODO [TASK 4.1]
     * Demo condition: game round considering as won if thrown fireball shoot the left side of game area
     * @param {Object} gameState
     * @return {GameStatus}
     */
  
    (gameState) => {
      // const deletedFireballs = gameState.objectsToDispose.filter(object => object.type === GameObjectType.FIREBALL);
      // const fenceHit = deletedFireballs.filter(fireball => fireball.x === x && fireball.y === y)[0];
      // console.log(x, y)

      // return fenceHit ? GameStatus.F : GameStatus.CONTINUE;

      // way_1
      const fireballs = gameState.objects.filter(object => object.type === GameObjectType.FIREBALL);
      const enemyArr = gameState.objects.filter(object => object.type === GameObjectType.ENEMY);
      const [{x, y}] = enemyArr;
      const enemyWidth = GameSpritesData[GameObjectType.ENEMY].width;
      const enemyHeight = GameSpritesData[GameObjectType.ENEMY].height;
      const fireballWidth = GameSpritesData[GameObjectType.FIREBALL].width;
      const fireballHeight = GameSpritesData[GameObjectType.FIREBALL].height;

      const fenceHit = fireballs.filter(fireball => fireball.x +fireballWidth > x  && fireballs.x < x + enemyWidth && fireballs.y < y -enemyHeight && fireballs.y - fireballHeight > y)[0];
      // console.log(enemyArr)

  return fenceHit? GameStatus.WIN : GameStatus.CONTINUE;

  // // way_2
  //     const fireballs = gameState.objects.filter(object => object.type === GameObjectType.FIREBALL);
  //     const enemyArr = gameState.objects.filter(object => object.type === GameObjectType.ENEMY);
  //     const [{x, y}] = enemyArr;

  //     if(fireballs) {
  //       const [{x : fx, y : fy}] = fireballs; 
  //       const enemyWidth = GameSpritesData[GameObjectType.ENEMY].width;
  //       const enemyHeight = GameSpritesData[GameObjectType.ENEMY].height;
  //       const fireballWidth = GameSpritesData[GameObjectType.FIREBALL].width;
  //       const fireballHeight = GameSpritesData[GameObjectType.FIREBALL].height;


  //       if(fx +fireballWidth > x  && fx < x + enemyWidth && fy < y -enemyHeight && fy - fireballHeight > y) {
  //         GameStatus = GameStatus.WIN;
  //         } else {
  //           GameStatus = GameStatus.CONTINUE
  //         }
  //       console.log(fx, fy)
  //       }
    },
  ];

  const onLevelInitialized = (gameState) => {
    const playerObj = new PlayerObject({
      direction: MovementDirection.RIGHT,
      height: GameConst.Player.getHeight(GameConst.Player.width),
      speed: GameConst.Player.speed,
      width: GameConst.Player.width,
      x: GameConst.Player.getX(GameFrame.WIDTH),
      y: GameConst.Player.getY(GameFrame.HEIGHT)
    });

    const enemyObj = new EnemyObject({
      direction: MovementDirection.LEFT,
      height: GameConst.Enemy.height,
      speed: GameConst.Enemy.speed,
      width: GameConst.Enemy.width,
      x: GameConst.Enemy.getX(GameFrame.WIDTH),
      y: GameConst.Enemy.getY(GameFrame.HEIGHT)
    })

    gameState.objects.push(playerObj);
    gameState.objects.push(enemyObj);
  };

  class Game {
    /**
     * @param {Element} container
     * @param {Function[]} rules
     * @param {Function | null} onLevelInitializedCallback
     * @constructor
     */
    constructor(container, rules, onLevelInitializedCallback = null) {
      this.container = container;
      this.rules = rules;
      this.onLevelInitialized = onLevelInitializedCallback;

      this._prepareRenderingContext();

      this._onKeyDown = this._onKeyDown.bind(this);
      this._onKeyUp = this._onKeyUp.bind(this);
      this._pauseListener = this._pauseListener.bind(this);

      this.setDeactivated(false);
    }

    _prepareRenderingContext() {
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.container.clientWidth;
      this.canvas.height = this.container.clientHeight;
      this.container.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');
    }

    /** @param {boolean} deactivated */
    setDeactivated(deactivated) {
      if (this._deactivated === deactivated) {
        return;
      }

      this._deactivated = deactivated;

      if (deactivated) {
        this._removeGameListeners();
      } else {
        this._initializeGameListeners();
      }
    }

    /**
     * @return {Object}
     */
    getInitialState() {
      return {
        currentStatus: GameStatus.CONTINUE,
        objectsToDispose: [], // deleted objects since the last game tick
        lastUpdated: null,
        keysPressed: {
          ESC: false,
          SPACE: false,
          LEFT: false,
          RIGHT: false,
          UP: false,
          DOWN: false
        },
        gameStartedAt: null,
        objects: [],
        startTime: null,
      };
    }

    /**
     * @param {boolean} restart
     */
    initializeLevelAndStart(restart = true) {
      if (restart || !this.state) {
        this._mediaIsPreloaded = false;
        this.state = this.getInitialState();

        if (this.onLevelInitialized) {
          this.onLevelInitialized(this.state);
        }
      } else {
        this.state.currentStatus = GameStatus.CONTINUE;
      }

      this.state.gameStartedAt = Date.now();
      if (!this.state.startTime) {
        this.state.startTime = this.state.gameStartedAt;
      }

      this._preloadImagesForLevel().then(() => {
        this.render();
        this._initializeGameListeners();
        this.processGameCycle();
      });
    }

    /**
     * @param {GameStatus=} verdict
     */
    pauseLevel(verdict) {
      if (verdict) {
        this.state.currentStatus = verdict;
      }

      this.state.keysPressed.ESC = false;
      this.state.lastUpdated = null;

      this._removeGameListeners();
      window.addEventListener('keydown', this._pauseListener);

      this._drawPauseScreen();
    }

    /**
     * @param {KeyboardEvent} evt
     * @private
     */
    _pauseListener(evt) {
      if (evt.keyCode === KeyCodes.SPACE && !this._deactivated) {
        evt.preventDefault();

        const isRestart = [GameStatus.WIN, GameStatus.FAIL].includes(this.state.currentStatus);
        this.initializeLevelAndStart(isRestart);

        window.removeEventListener('keydown', this._pauseListener);
      }
    }

    _drawPauseScreen() {
      this._drawMessage(GAME_MESSAGES[this.state.currentStatus]);
    }

    _drawMessage(message) {
      const ctx = this.ctx;

      const drawCloud = (x, y, width, heigth) => {
        const offset = 2;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + offset, y + heigth / 2);
        ctx.lineTo(x, y + heigth);
        ctx.lineTo(x + width / 2, y + heigth - offset);
        ctx.lineTo(x + width, y + heigth);
        ctx.lineTo(x + width - offset, y + heigth / 2);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width / 2, y + offset);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();
        ctx.fill();
      };

      ctx.fillStyle = 'rgba(256, 256, 256, .3)';
      drawCloud(195, 85, 220, 100);

      ctx.fillStyle = 'rgba(256, 256, 256, 0.8)';
      drawCloud(190, 80, 220, 100);

      ctx.fillStyle = '#000';
      ctx.font = '16px PT Mono';
      message.split('\n').forEach((line, i) => ctx.fillText(line, 210, 130 + 20 * i));
    }

    /**
     * @param {Object} spriteObj
     * @return {Promise<void>}
     * @private
     */
    _loadSpriteObject(spriteObj) {
      return new Promise((resolve => {
        const image = new Image(spriteObj.width, spriteObj.height);
        image.src = spriteObj.url;
        image.onload = () => {
          spriteObj.image = image;
          resolve();
        };
      }));
    }

    /** @private */
    async _preloadImagesForLevel() {
      if (this._mediaIsPreloaded) {
        return;
      }

      const keys = Object.keys(GameSpritesData);
      await Promise.all(keys.map(GameSpritesDataKey => this._loadSpriteObject(GameSpritesData[GameSpritesDataKey])));
      this._mediaIsPreloaded = true;
    }

    /**
     * @param {number} delta - time elapsed since the previous game tick
     */
    processGameObjects(delta) {
      this.state.objectsToDispose = [];
      this.state.objects.forEach(object => object.behave(this.state, delta));
      this.state.objectsToDispose = this.state.objects.filter(object => object.state === ObjectState.DISPOSED);
      this.state.objects = this.state.objects.filter(object => !this.state.objectsToDispose.includes(object));
    }

    checkStatus() {
      if (this.state.currentStatus !== GameStatus.CONTINUE) {
        return;
      }

      let currentCheck = GameStatus.CONTINUE;
      let ruleIdx = 0;

      while (ruleIdx < this.rules.length && currentCheck === GameStatus.CONTINUE) {
        currentCheck = this.rules[ruleIdx](this.state);
        ruleIdx++;
      }

      this.state.currentStatus = currentCheck;
    }

    /**
     * @param {GameStatus} status
     */
    setGameStatus(status) {
      if (this.state.currentStatus !== status) {
        this.state.currentStatus = status;
      }
    }

    render() {
      this.ctx.clearRect(0, 0, GameFrame.WIDTH, GameFrame.HEIGHT);

      this.state.objects.forEach(object => {
        if (!object.sprite) {
          return;
        }

        const isFlipped = object.direction & MovementDirection.LEFT;
        const sprite = GameSpritesData[object.type + (isFlipped ? FLIPPED : '')] || GameSpritesData[object.type];

        this.ctx.save();
        this.ctx.translate(object.x, object.y);
        this.ctx.rotate(object.angle * Math.PI / 180);
        this.ctx.drawImage(sprite.image, 0, 0, object.width, object.height);
        this.ctx.restore();
      });
    }

    processGameCycle() {
      const now = Date.now();

      if (!this.state.lastUpdated) {
        this.state.lastUpdated = now;
      }

      const delta = (now - this.state.lastUpdated) / 10;
      this.processGameObjects(delta);
      this.checkStatus();

      switch (this.state.currentStatus) {
        case GameStatus.CONTINUE:
          this.state.lastUpdated = now;
          this.render();
          requestAnimationFrame(() => this.processGameCycle());
          break;

        case GameStatus.WIN:
        case GameStatus.FAIL:
        case GameStatus.PAUSE:
        case GameStatus.INTRO:
          this.pauseLevel();
          break;
      }
    }

    /**
     * @param evt {KeyboardEvent} evt
     * @param stateModifierVal {boolean}
     * @private
     */
    _updateKeyState(evt, stateModifierVal) {
      const keysMap = {
        [KeyCodes.ARROW_LEFT]: 'LEFT',
        [KeyCodes.ARROW_RIGHT]: 'RIGHT',
        [KeyCodes.ARROW_UP]: 'UP',
        [KeyCodes.ARROW_DOWN]: 'DOWN',
        [KeyCodes.ESCAPE]: 'ESC',
        [KeyCodes.SPACE]: 'SPACE',
      };

      if (keysMap.hasOwnProperty(evt.keyCode)) {
        this.state.keysPressed[keysMap[evt.keyCode]] = stateModifierVal;
      }

      if (evt.shiftKey) {
        this.state.keysPressed.SHIFT = stateModifierVal;
      }
    }

    /**
     * @param {KeyboardEvent} evt
     * @private
     */
    _onKeyDown(evt) {
      this._updateKeyState(evt, true);
    }

    /**
     * @param {KeyboardEvent} evt
     * @private
     */
    _onKeyUp(evt) {
      this._updateKeyState(evt, false);
    }

    /** @private */
    _initializeGameListeners() {
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);
    }

    /** @private */
    _removeGameListeners() {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
  }

  const game = new Game(document.querySelector('#game-area'), GAME_RULES, onLevelInitialized);

  window.restartGame = () => {
    game.initializeLevelAndStart();
    game.setGameStatus(GameStatus.INTRO);
  };

  window.restartGame();

  return game;
})();