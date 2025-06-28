#!/usr/bin/env node

import { createClient } from 'redis';
import chalk from 'chalk';

const redisClient = createClient();

// Conectar a Redis
await redisClient.connect();

console.log(chalk.green('🔍 Monitor de Sesiones Redis iniciado...\n'));

// Función para formatear JSON
const formatJSON = (jsonString) => {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch {
    return jsonString;
  }
};

// Función para mostrar sesiones
const showSessions = async () => {
  try {
    // Obtener todas las claves de sesión
    const keys = await redisClient.keys('sess:*');
    
    if (keys.length === 0) {
      console.log(chalk.yellow('📭 No hay sesiones activas'));
      return;
    }

    console.log(chalk.blue(`📊 ${keys.length} sesiones activas:\n`));

    for (const key of keys) {
      const sessionData = await redisClient.get(key);
      const ttl = await redisClient.ttl(key);
      
      console.log(chalk.cyan(`🔑 ${key}`));
      console.log(chalk.gray(`⏰ TTL: ${ttl}s`));
      console.log(chalk.white('📄 Datos:'));
      console.log(formatJSON(sessionData));
      console.log(chalk.gray('─'.repeat(50)));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error:', error.message));
  }
};

// Función para monitorear en tiempo real
const monitorSessions = () => {
  console.log(chalk.green('👁️  Monitoreando operaciones en tiempo real...\n'));
  
  const monitor = redisClient.monitor();
  
  monitor.on('data', (data) => {
    const command = data.toString().trim();
    if (command.includes('sess:')) {
      console.log(chalk.magenta(`🔄 ${new Date().toLocaleTimeString()}: ${command}`));
    }
  });
};

// Función para limpiar sesiones expiradas
const cleanExpiredSessions = async () => {
  try {
    const keys = await redisClient.keys('sess:*');
    let cleaned = 0;
    
    for (const key of keys) {
      const ttl = await redisClient.ttl(key);
      if (ttl <= 0) {
        await redisClient.del(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(chalk.yellow(`🧹 Limpiadas ${cleaned} sesiones expiradas`));
    } else {
      console.log(chalk.green('✅ No hay sesiones expiradas para limpiar'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error limpiando sesiones:', error.message));
  }
};

// Función para mostrar estadísticas
const showStats = async () => {
  try {
    const keys = await redisClient.keys('sess:*');
    const totalSessions = keys.length;
    
    let activeSessions = 0;
    let expiredSessions = 0;
    
    for (const key of keys) {
      const ttl = await redisClient.ttl(key);
      if (ttl > 0) {
        activeSessions++;
      } else {
        expiredSessions++;
      }
    }
    
    console.log(chalk.blue('📈 Estadísticas de Sesiones:'));
    console.log(chalk.white(`   Total: ${totalSessions}`));
    console.log(chalk.green(`   Activas: ${activeSessions}`));
    console.log(chalk.red(`   Expiradas: ${expiredSessions}`));
    
    if (totalSessions > 0) {
      const avgTTL = await Promise.all(
        keys.map(async (key) => await redisClient.ttl(key))
      ).then(ttls => {
        const validTTLs = ttls.filter(ttl => ttl > 0);
        return validTTLs.length > 0 ? validTTLs.reduce((a, b) => a + b, 0) / validTTLs.length : 0;
      });
      
      console.log(chalk.yellow(`   TTL Promedio: ${Math.round(avgTTL)}s`));
    }
  } catch (error) {
    console.error(chalk.red('❌ Error obteniendo estadísticas:', error.message));
  }
};

// Función principal
const main = async () => {
  const command = process.argv[2];
  
  switch (command) {
    case 'list':
      await showSessions();
      break;
      
    case 'monitor':
      monitorSessions();
      break;
      
    case 'clean':
      await cleanExpiredSessions();
      break;
      
    case 'watch':
      console.log(chalk.green('👀 Monitoreando sesiones cada 5 segundos...\n'));
      setInterval(showSessions, 5000);
      break;
      
    case 'stats':
      await showStats();
      break;
      
    default:
      console.log(chalk.blue('🔍 Monitor de Sesiones Redis'));
      console.log(chalk.gray('Comandos disponibles:'));
      console.log(chalk.white('  list    - Mostrar todas las sesiones'));
      console.log(chalk.white('  monitor - Monitorear operaciones en tiempo real'));
      console.log(chalk.white('  clean   - Limpiar sesiones expiradas'));
      console.log(chalk.white('  watch   - Monitorear sesiones cada 5 segundos'));
      console.log(chalk.white('  stats   - Mostrar estadísticas de sesiones'));
      console.log(chalk.gray('\nEjemplo: node redis-monitor.js list'));
  }
  
  if (command !== 'monitor' && command !== 'watch') {
    await redisClient.quit();
  }
};

// Manejar errores
redisClient.on('error', (err) => {
  console.error(chalk.red('❌ Error de Redis:', err.message));
  process.exit(1);
});

// Ejecutar
main().catch(console.error);
