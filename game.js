// 1. 首先初始化画布
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 2. 初始化资源
const images = {};
const sounds = {};

// 3. 玩家飞船初始化
const player = {
    x: window.innerWidth / 2,
    y: window.innerHeight - 50,
    width: 50,
    height: 50,
    speed: 5,
    lives: 3,
    minY: window.innerHeight / 2,
    maxY: window.innerHeight - 50
};

// 4. 游戏状态变量
let gameStarted = false;
let isGameOver = false;
let score = 0;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let canShoot = true;
let isShooting = false;
const shootDelay = 150;

// 5. 加载图片
images.player = new Image();
images.enemy = new Image();
images.explosion = new Image();

images.player.src = './images/player.png';
images.enemy.src = './images/enemy.png';
images.explosion.src = './images/explosion.png';

// 6. 加载音频
try {
    sounds.laser = new Audio('./sounds/laser.mp3');
    sounds.explosion = new Audio('./sounds/explosion.mp3');
    sounds.background = new Audio('./sounds/background.mp3');
    sounds.shoot = new Audio('./sounds/shoot.mp3');

    // 设置音效音量和背景音乐循环
    sounds.background.loop = true;
    sounds.background.volume = 0.3;
    sounds.shoot.volume = 0.5;
    sounds.explosion.volume = 0.5;

    // 添加加载事件监听器
    sounds.background.addEventListener('canplaythrough', () => {
        console.log('背景音乐加载完成');
    });
    sounds.background.addEventListener('error', (e) => {
        console.error('背景音乐加载失败:', e);
    });
    
    console.log('音频初始化完成');
} catch (error) {
    console.error('音频加载失败:', error);
}

// 7. 游戏数组初始化
let lasers = [];
let enemies = [];
let explosions = [];

// 1. 设置全屏函数
function setFullscreen() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 更新玩家位置限制
    if (player) {
        player.minY = canvas.height / 2;
        player.maxY = canvas.height - 50;
        
        // 重置玩家位置
        if (!isGameOver) {
            player.x = canvas.width / 2;
            player.y = canvas.height - 50;
        }
    }
    
    // 重新初始化星云
    initNebula(300);
}

// 2. 游戏说明控制
function showInstructions() {
    const gameInstructions = document.getElementById('gameInstructions');
    
    // 基本样式设置 - 调整大小和间距
    gameInstructions.style.position = 'fixed';
    gameInstructions.style.top = '50%';
    gameInstructions.style.left = '50%';
    gameInstructions.style.transform = 'translate(-50%, -50%)';
    gameInstructions.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    gameInstructions.style.color = 'white';
    gameInstructions.style.padding = '20px';  // 减小内边距
    gameInstructions.style.borderRadius = '10px';
    gameInstructions.style.zIndex = '1000';
    gameInstructions.style.maxWidth = '400px';  // 减小最大宽度
    gameInstructions.style.width = '80%';
    gameInstructions.style.maxHeight = '70vh';  // 减小最大高度
    gameInstructions.style.overflow = 'auto';
    gameInstructions.style.fontFamily = 'Arial, sans-serif';
    gameInstructions.style.fontSize = '14px';   // 减小字体大小
    gameInstructions.style.textAlign = 'center';
    gameInstructions.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';

    // 主标题样式 - 减小间距
    const h2 = gameInstructions.querySelector('h2');
    if (h2) {
        h2.style.color = '#4CAF50';
        h2.style.marginBottom = '15px';  // 减小底部间距
        h2.style.fontSize = '24px';      // 减小字体大小
        h2.style.textShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
    }

    // 子标题样式 - 减小间距
    const h3Elements = gameInstructions.querySelectorAll('h3');
    h3Elements.forEach(h3 => {
        h3.style.color = '#4CAF50';
        h3.style.fontSize = '18px';      // 减小字体大小
        h3.style.marginBottom = '8px';   // 减小底部间距
        h3.style.textShadow = '0 0 5px rgba(76, 175, 80, 0.3)';
    });

    // 区块样式 - 减小间距
    const sections = gameInstructions.querySelectorAll('.instruction-section');
    sections.forEach(section => {
        section.style.marginBottom = '15px';  // 减小底部间距
        section.style.padding = '10px';       // 减小内边距
        section.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        section.style.borderRadius = '5px';
        section.style.border = '1px solid rgba(76, 175, 80, 0.3)';
    });

    // 段落样式 - 减小间距
    const paragraphs = gameInstructions.querySelectorAll('p');
    paragraphs.forEach(p => {
        p.style.margin = '5px 0';  // 减小段落间距
    });

    // 开始游戏按钮样式
    const button = gameInstructions.querySelector('.start-button');
    if (button) {
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.padding = '10px 25px';   // 调整按钮大小
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.fontSize = '18px';       // 减小字体大小
        button.style.cursor = 'pointer';
        button.style.marginTop = '15px';      // 减小顶部间距
        button.style.transition = 'all 0.3s ease';
        button.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
    }

    // 添加按钮悬停效果
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#45a049';
        button.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.7)';
    });

    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#4CAF50';
        button.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
    });
    
    gameInstructions.style.display = 'block';
    if (sounds.background) {
        sounds.background.pause();
    }
}

function hideInstructions() {
    console.log("开始游戏");
    document.getElementById('gameInstructions').style.display = 'none';
    gameStarted = true;
    if (sounds.background) {
        sounds.background.play().catch(e => console.log("音乐播放失败"));
    }
    setFullscreen();
    console.log("画布大小:", canvas.width, canvas.height);
    console.log("玩家位置:", player.x, player.y);
    requestAnimationFrame(gameLoop);
}

// 3. 音乐控制
function startBackgroundMusic() {
    sounds.background.play().catch(e => console.log("背景音乐播放失败"));
}

function stopBackgroundMusic() {
    sounds.background.pause();
    sounds.background.currentTime = 0;
}

// 4. 设置 Canvas 样式
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.backgroundColor = 'black';

// 5. 设置分数显示
const scoreElement = document.getElementById('score');
scoreElement.style.position = 'fixed';
scoreElement.style.top = '20px';
scoreElement.style.left = '20px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '24px';
scoreElement.style.fontFamily = 'Arial';
scoreElement.style.zIndex = '1000';

// 6. 添加生命值显示
const lifeElement = document.createElement('div');
lifeElement.style.position = 'fixed';
lifeElement.style.top = '50px';
lifeElement.style.left = '20px';
lifeElement.style.color = 'white';
lifeElement.style.fontSize = '24px';
lifeElement.style.fontFamily = 'Arial';
lifeElement.style.zIndex = '1000';
document.body.appendChild(lifeElement);

// 1. 星云背景配置
let nebula = {
    particles: [],
    colors: [
        'rgba(25, 29, 85, 0.7)',    // 深蓝
        'rgba(48, 44, 107, 0.7)',   // 深紫
        'rgba(15, 15, 35, 0.7)',    // 暗蓝
        'rgba(255, 255, 255, 0.5)', // 星星
        'rgba(168, 191, 255, 0.5)'  // 亮蓝
    ],
    starColors: [
        'rgba(255, 255, 255, 0.8)',
        'rgba(255, 240, 220, 0.8)',
        'rgba(200, 220, 255, 0.8)'
    ]
};

// 2. 星云粒子类
class NebulaParticle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.isStar = Math.random() < 0.3;
        
        if (this.isStar) {
            this.size = 0.5 + Math.random() * 1;
            this.speed = 0.05 + Math.random() * 0.1;
            this.color = nebula.starColors[Math.floor(Math.random() * nebula.starColors.length)];
            this.alpha = 0.5 + Math.random() * 0.5;
            this.twinkleSpeed = 0.03 + Math.random() * 0.03;
        } else {
            this.size = 2 + Math.random() * 3;
            this.speed = 0.1 + Math.random() * 0.2;
            this.color = nebula.colors[Math.floor(Math.random() * nebula.colors.length)];
            this.alpha = 0.1 + Math.random() * 0.2;
        }

        this.angle = Math.random() * Math.PI * 2;
        this.deltaAlpha = this.twinkleSpeed || (0.002 * (Math.random() - 0.5));
        this.originalAlpha = this.alpha;
    }

    update() {
        if (this.isStar) {
            this.alpha += Math.sin(Date.now() * this.twinkleSpeed) * 0.1;
            this.alpha = Math.max(0.1, Math.min(1, this.alpha));
        } else {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.alpha += this.deltaAlpha;

            if (this.alpha > this.originalAlpha + 0.2 || this.alpha < this.originalAlpha - 0.2) {
                this.deltaAlpha *= -1;
            }
        }

        if (this.x < 0 || this.x > canvas.width || 
            this.y < 0 || this.y > canvas.height) {
            this.reset();
        }

        return true;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        
        if (this.isStar) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            if (Math.random() < 0.1) {
                ctx.save();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(this.x - this.size * 2, this.y);
                ctx.lineTo(this.x + this.size * 2, this.y);
                ctx.moveTo(this.x, this.y - this.size * 2);
                ctx.lineTo(this.x, this.y + this.size * 2);
                ctx.stroke();
                ctx.restore();
            }
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
}

// 3. 爆炸效果类
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.frame = 0;
        this.frameCount = 8;
        this.frameDelay = 3;
        this.frameCounter = 0;
    }

    update() {
        this.frameCounter++;
        if (this.frameCounter >= this.frameDelay) {
            this.frame++;
            this.frameCounter = 0;
        }
        return this.frame < this.frameCount;
    }

    draw(ctx) {
        try {
            ctx.drawImage(
                images.explosion,
                this.frame * this.width, 0,
                this.width, this.height,
                this.x - this.width/2, this.y - this.height/2,
                this.width, this.height
            );
        } catch(e) {
            console.log("爆炸效果绘制失败");
        }
    }
}

// 1. 初始化星云
function initNebula(count) {
    nebula.particles = [];
    for (let i = 0; i < count; i++) {
        nebula.particles.push(new NebulaParticle());
    }
}

// 2. 更新星云背景
function updateNebula() {
    ctx.fillStyle = 'rgba(5, 5, 20, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 1.5
    );
    gradient.addColorStop(0, 'rgba(25, 29, 85, 0.2)');
    gradient.addColorStop(0.5, 'rgba(11, 11, 39, 0.2)');
    gradient.addColorStop(1, 'rgba(5, 5, 20, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let particle of nebula.particles) {
        particle.update();
        particle.draw();
    }
}

// 3. 更新生命值显示
function updateLifeDisplay() {
    lifeElement.textContent = '生命值: ' + player.lives;
}

// 4. 更新玩家位置
function updatePlayerPosition() {
    if (moveLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (moveRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (moveUp && player.y > player.minY) {
        player.y -= player.speed;
    }
    if (moveDown && player.y < player.maxY) {
        player.y += player.speed;
    }
}

// 5. 射击函数
function shoot() {
    if (canShoot) {
        lasers.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 7
        });
        
        sounds.shoot.currentTime = 0;
        sounds.shoot.play().catch(e => console.log("音效播放失败"));
        
        canShoot = false;
        setTimeout(() => {
            canShoot = true;
            if (isShooting) {
                shoot();
            }
        }, shootDelay);
    }
}

// 6. 更新激光位置
function updateLasers() {
    for(let i = lasers.length - 1; i >= 0; i--) {
        lasers[i].y -= lasers[i].speed;
        
        ctx.fillStyle = 'red';
        ctx.fillRect(lasers[i].x, lasers[i].y, lasers[i].width, lasers[i].height);
        
        if(lasers[i].y < 0) lasers.splice(i, 1);
    }
}

// 7. 创建和更新敌人
function createEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 30),
        y: 0,
        width: 30,
        height: 30,
        speed: 2  // 固定敌人速度为2
    });
}

function updateEnemies() {
    if(Math.random() < 0.02) createEnemy();
    
    for(let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemies[i].speed;
        
        ctx.drawImage(images.enemy, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
        
        if(enemies[i].y > canvas.height) enemies.splice(i, 1);
    }
}

// 8. 碰撞检测
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkCollisions() {
    for(let i = lasers.length - 1; i >= 0; i--) {
        for(let j = enemies.length - 1; j >= 0; j--) {
            if(collision(lasers[i], enemies[j])) {
                explosions.push(new Explosion(
                    enemies[j].x + enemies[j].width/2,
                    enemies[j].y + enemies[j].height/2
                ));
                
                sounds.explosion.currentTime = 0;
                sounds.explosion.play().catch(e => console.log("音效播放失败"));
                
                score += 100;
                scoreElement.textContent = '分数: ' + score;
                
                lasers.splice(i, 1);
                enemies.splice(j, 1);
                break;
            }
        }
    }
}

function checkPlayerEnemyCollision() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (collision(player, enemies[i])) {
            explosions.push(new Explosion(
                player.x + player.width/2,
                player.y + player.height/2
            ));
            
            player.lives--;
            updateLifeDisplay();
            enemies.splice(i, 1);
            
            sounds.explosion.currentTime = 0;
            sounds.explosion.play().catch(e => console.log("音效播放失败"));
            
            if (player.lives <= 0) {
                gameOver();
            }
        }
    }
}

// 1. 游戏结束和重置
function gameOver() {
    isGameOver = true;
    stopBackgroundMusic();
}

function resetGame() {
    console.log('重置游戏');
    // 重置玩家状态
    player.lives = 3;
    player.speed = 5;  // 重置玩家速度
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;

    // 重置游戏状态
    score = 0;
    isGameOver = false;
    enemies = [];
    lasers = [];
    explosions = [];
    
    // 重置移动状态
    moveLeft = false;
    moveRight = false;
    moveUp = false;
    moveDown = false;
    
    // 重置射击状态
    canShoot = true;
    isShooting = false;

    // 更新显示
    scoreElement.textContent = '分数: ' + score;
    updateLifeDisplay();
    
    // 重置音乐
    startBackgroundMusic();

    // 重新初始化星云
    initNebula(300);
}

// 2. 游戏主循环
function gameLoop() {
    if (!gameStarted && !isGameOver) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 20, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('最终得分: ' + score, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText('按空格键重新开始', canvas.width / 2, canvas.height / 2 + 80);
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateNebula();
    updatePlayerPosition();

    try {
        ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
    } catch(e) {
        console.error("玩家绘制失败:", e);
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    if (gameStarted) {
        if (isShooting && canShoot) {
            shoot();
        }
        
        updateLasers();
        updateEnemies();
        checkCollisions();
        checkPlayerEnemyCollision();
        
        for (let i = explosions.length - 1; i >= 0; i--) {
            if (!explosions[i].update()) {
                explosions.splice(i, 1);
            } else {
                explosions[i].draw(ctx);
            }
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// 3. 事件监听器
document.addEventListener('keydown', (e) => {
    if (isGameOver) {
        if (e.code === 'Space') {
            resetGame();
            requestAnimationFrame(gameLoop);
        }
        return;
    }

    switch(e.code) {
        case 'ArrowLeft':
            moveLeft = true;
            break;
        case 'ArrowRight':
            moveRight = true;
            break;
        case 'ArrowUp':
            moveUp = true;
            break;
        case 'ArrowDown':
            moveDown = true;
            break;
        case 'Space':
            isShooting = true;
            shoot();
            break;
        case 'KeyM':
            if (sounds.background.paused) {
                startBackgroundMusic();
            } else {
                stopBackgroundMusic();
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft':
            moveLeft = false;
            break;
        case 'ArrowRight':
            moveRight = false;
            break;
        case 'ArrowUp':
            moveUp = false;
            break;
        case 'ArrowDown':
            moveDown = false;
            break;
        case 'Space':
            isShooting = false;
            break;
    }
});

// 4. 触摸控制
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    player.x = touch.clientX - rect.left - player.width / 2;
    player.y = touch.clientY - rect.top - player.height / 2;
    isShooting = true;
}, false);

canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        player.x = touch.clientX - rect.left - player.width / 2;
        player.y = touch.clientY - rect.top - player.height / 2;
        
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(player.minY, Math.min(player.maxY, player.y));
    }
}, false);

canvas.addEventListener('touchend', function(e) {
    e.preventDefault();
    isShooting = false;
}, false);

// 5. 初始化和启动
function initGame() {
    setFullscreen();
    updateLifeDisplay();
    showInstructions();
    initNebula(300);
    gameLoop();
    
    sounds.background.loop = true;
    sounds.background.volume = 0.5;
}

// 6. 其他事件监听
window.addEventListener('load', () => {
    initGame();
});

window.addEventListener('resize', setFullscreen);

document.addEventListener('click', () => {
    startBackgroundMusic();
}, { once: true });
