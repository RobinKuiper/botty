const express = require("express");
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

// Routes
const admin = require("./routes/admin");
const messages = require("./routes/messages");

class WebSocket {
  constructor(token, port, client) {
    this.folders = {
      modules: path.join(__dirname, '../modules'),
      events: path.join(__dirname, '../events'),
      commands: path.join(__dirname, '../commands'),
      config: path.join(__dirname, '../config')
    };

    this.token = token;
    this.client = client;

    this.app = express();
    this.app.engine(
      "hbs",
      hbs({
        extname: "hbs",
        defaultLayout: "layout",
        layoutsDir: __dirname + "/layouts",
        helpers: {
          if: (variable, value, option1, option2) =>
            variable === value ? option1 : option2,
        },
      })
    );
    this.app.set("views", path.join(__dirname, "views"));
    this.app.set("view engine", "hbs");
    this.app.use(express.static(path.join(__dirname, "public")));
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use((req, res, next) => {
      var _token = req.body.token || req.query.token;

      if (!this.checkToken(_token))
        return res.render("error", {
          title: "Error",
          error: "Invalid Token",
          layout: "error",
        });

      next();
    });

    this.registerRoutes();

    this.app.use(function (req, res, next) {
      res.status(404);

      // respond with html page
      if (req.accepts("html")) {
        res.render("404", { url: req.url });
        return;
      }

      // respond with json
      if (req.accepts("json")) {
        res.send({ error: "Not found" });
        return;
      }

      // default to plain-text. send()
      res.type("txt").send("Not found");
    });

    this.server = this.app.listen(port, () => {
      this.client.info(`***************************************`);
      this.client.info(`*         Webserver Running.          *`);
      this.client.info(`*         Port ${this.server.address().port}                   *`);
      this.client.info(`*         Token ${this.token}                *`);
      this.client.info(`***************************************`);
    });
  }

  registerRoutes() {
    this.app.get("/", (req, res) => {
      admin.index(req, res, this.client);
    });

    this.app.get("/messages", (req, res) => {
      messages.page(req, res, this.client);
    });

    this.app.post("/sendMessage", (req, res) => {
      messages.sendNormalMessage(req, res, this.client)
    });

    this.app.post("/sendEmbed", (req, res) => {
      messages.sendEmbedMessage(req, res, this.client);
    });

    this.registerModuleRoutes();
  }

  registerModuleRoutes(){
    for (let moduleName in this.client.modules) {
      const modulePath = path.join(this.client.folders.modules, moduleName);
      const routesPath = path.join(modulePath, "routes");

      const module = this.client.modules[moduleName];

      // Routes
      for (const routesName in module.routes) {
        const route = require(path.join(
          routesPath,
          module.routes[routesName].file
        ));

        if(route.type === 'post'){
          this.app.post(`/${module.name}/${route.route}`, (req, res) => {
            route.execute(req, res, this.client);
          })
        }else if(route.type === 'get'){
          this.app.get(`/${module.name}/${route.route}`, (req, res) => {
            route.execute(req, res, this.client);
          })
        }

        this.client.log(
          "info",
          `[Module Route] ${module.name} ${route.route} loaded.`
        );
      }
    }
  }

  checkToken(_token) {
    return _token == this.token;
  }
}

module.exports = WebSocket;
