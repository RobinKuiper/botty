module.exports = {
  apps : [{
    name: "botty",
    script: 'main.js',
    watch: true,
    ignore_watch : ["node_modules", "client/img", "database.sqlite", "database.sqlite-journal", "logs", "data/database.sqlite"]
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
