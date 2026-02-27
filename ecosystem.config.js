module.exports = {
  apps: [
    {
      name: 'fenixbot-wa',
      script: './src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production'
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Reiniciar si falla
      exp_backoff_restart_delay: 100,
      // No reiniciar si falla más de 10 veces en 1 minuto
      min_uptime: '1m',
      max_restarts: 10
    }
  ]
};