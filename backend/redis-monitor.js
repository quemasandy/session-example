#!/usr/bin/env node

/**
 * Redis Session Monitor
 * 
 * A comprehensive monitoring tool for Redis-based session storage.
 * This utility helps developers understand how sessions are stored,
 * managed, and expired in Redis.
 * 
 * Features:
 * - List all active sessions with their data and TTL
 * - Monitor Redis operations in real-time
 * - Clean up expired sessions
 * - Display session statistics
 * - Continuous monitoring mode
 * 
 * Usage:
 *   node redis-monitor.js [command]
 * 
 * Commands:
 *   list    - Show all sessions
 *   monitor - Watch Redis operations
 *   clean   - Remove expired sessions
 *   stats   - Show session statistics
 *   watch   - Continuous monitoring
 */

import { createClient } from 'redis';
import chalk from 'chalk';

/**
 * Redis Client Configuration
 * 
 * Creates connection to local Redis instance where sessions are stored.
 * Uses default Redis configuration (localhost:6379, no auth).
 */
const redisClient = createClient();

// Establish connection to Redis server
await redisClient.connect();

console.log(chalk.green('🔍 Monitor de Sesiones Redis iniciado...\n'));

/**
 * JSON Formatting Utility
 * 
 * Safely formats JSON strings for readable display.
 * Session data in Redis is stored as JSON strings.
 * 
 * @param {string} jsonString - Raw JSON string from Redis
 * @returns {string} Formatted JSON or original string if parsing fails
 */
const formatJSON = (jsonString) => {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch {
    return jsonString;
  }
};

/**
 * Display All Active Sessions
 * 
 * Retrieves and displays all session data from Redis:
 * 1. Finds all keys matching 'sess:*' pattern
 * 2. Gets session data and TTL for each key
 * 3. Formats and displays session information
 * 
 * Session keys follow the pattern: sess:{sessionId}
 * Session data includes user info, authentication status, and cookie config.
 */
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

/**
 * Real-Time Redis Operations Monitor
 * 
 * Uses Redis MONITOR command to watch all operations in real-time.
 * Filters and displays only session-related operations (keys containing 'sess:').
 * 
 * This helps understand when sessions are:
 * - Created (SET operations)
 * - Retrieved (GET operations)
 * - Updated (SET operations with new data)
 * - Expired/Deleted (DEL operations)
 */
const monitorSessions = () => {
  console.log(chalk.green('👁️  Monitoreando operaciones en tiempo real...\n'));
  
  // Enable Redis monitoring mode
  const monitor = redisClient.monitor();
  
  // Filter and display session-related operations
  monitor.on('data', (data) => {
    const command = data.toString().trim();
    if (command.includes('sess:')) {
      console.log(chalk.magenta(`🔄 ${new Date().toLocaleTimeString()}: ${command}`));
    }
  });
};

/**
 * Clean Up Expired Sessions
 * 
 * Removes sessions that have expired (TTL <= 0) from Redis.
 * This is normally handled automatically by Redis, but can be
 * useful for immediate cleanup during development/testing.
 */
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

/**
 * Display Session Statistics
 * 
 * Calculates and displays useful metrics about session usage:
 * - Total number of sessions
 * - Active vs expired session counts
 * - Average TTL of active sessions
 * 
 * Helps understand session lifecycle and usage patterns.
 */
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

/**
 * Main Application Entry Point
 * 
 * Parses command line arguments and routes to appropriate function.
 * Provides help information when no command is specified.
 */
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

/**
 * Error Handling and Application Startup
 * 
 * Sets up error handlers for Redis connection issues
 * and starts the main application with error catching.
 */
redisClient.on('error', (err) => {
  console.error(chalk.red('❌ Error de Redis:', err.message));
  process.exit(1);
});

// Start the application
main().catch(console.error);
