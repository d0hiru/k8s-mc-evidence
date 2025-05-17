const mineflayer = require('mineflayer');

function createBot() {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST || 'minecraft-service',
    port: parseInt(process.env.MC_PORT) || 25565,
    username: 'bot_' + Math.floor(Math.random() * 10000),
    version: '1.20.4'
  });

  bot.on('spawn', () => {
    console.log(`${bot.username} spawned`);

    // 0.5초마다 채팅 (부하 유도는 되지만 충돌은 없음)
    setInterval(() => {
      bot.chat('채팅폭탄! 렉걸려라!');
    }, 500);

    // 1초마다 점프 (지속적인 물리 연산 유도)
    setInterval(() => {
      if (bot.entity.onGround) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 100);
      }
    }, 1000);

    // 1초마다 시야 흔들기 (서버 위치 처리 증가)
    setInterval(() => {
      const yaw = Math.random() * Math.PI * 2;
      const pitch = Math.random() * 0.5 - 0.25;
      bot.look(yaw, pitch, true);
    }, 1000);

    // 2초마다 인벤토리 열기 시도 (패킷 증가)
    setInterval(() => {
      const chest = Object.values(bot.entities).find(e => e.name === 'chest');
      if (chest) {
        bot.openChest(chest).catch(() => {});
      }
    }, 2000);
  });

  bot.on('end', () => {
    console.log(`${bot.username} ended, respawning...`);
    setTimeout(createBot, 5000);
  });

  bot.on('error', err => {
    console.log(`${bot.username} error: ${err.message}`);
  });
}

createBot();
