module.exports = {
  apps : [{
    name: "botty",
    script: 'main.js',
    watch: true,
    ignore_watch : ["node_modules", "client/img", "data/database.sqlite-journal", "logs", "data/database.sqlite", "config/modules.json", "modules/minecraft/servers.json", "modules/voicecloner/channels.json"]
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};