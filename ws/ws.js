const express = require("express");
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

class WebSocket {
  constructor(token, port, client) {
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

    this.registerRoutes();

    this.app.use(function(req, res, next){
        res.status(404);
      
        // respond with html page
        if (req.accepts('html')) {
          res.render('404', { url: req.url });
          return;
        }
      
        // respond with json
        if (req.accepts('json')) {
          res.send({ error: 'Not found' });
          return;
        }
      
        // default to plain-text. send()
        res.type('txt').send('Not found');
      });

    this.server = this.app.listen(port, () => {
      console.log(`Websocket listening on port ${this.server.address().port}`);
    });
  }

  checkToken(_token) {
    return _token == this.token;
  }

  registerRoutes() {
    this.app.get("/", (req, res) => {
      var _token = req.query.token;

      if (!this.checkToken(_token))
        return res.render("error", { title: "Error", error: "Invalid Token", layout: "error" });

      const channels = [];
      this.client.guilds.cache
        .first()
        .channels.cache.filter((c) => c.type === "text")
        .forEach((c) => {
          channels.push({ id: c.id, name: c.name });
        });

      let modules = null;

      if (fs.existsSync("config/modules.json"))
        modules = JSON.parse(fs.readFileSync("config/modules.json"));

      res.render("index", { title: "", token: _token, channels, modules });
    });

    this.app.get("/messages", (req, res) => {
      var _token = req.query.token;

      if (!this.checkToken(_token))
        return res.render("error", { title: "Error", error: "Invalid Token" });

      const channels = [];
      this.client.guilds.cache
        .first()
        .channels.cache.filter((c) => c.type === "text")
        .forEach((c) => {
          channels.push({ id: c.id, name: c.name });
        });

      res.render("messages", { title: "Messages", token: _token, channels });
    });

    this.app.post("/sendMessage", (req, res) => {
      var _token = req.body.token;
      var message = req.body.message;
      var channelid = req.body.channelid;

      if (!this.checkToken(_token)) return;

      const channel = this.client.guilds.cache
        .first()
        .channels.cache.get(channelid);
      if (channel) {
        channel.send(message);
      }
    });

    this.app.post("/sendEmbed", (req, res) => {
      const {
        token,
        title,
        description,
        thumbnail,
        footertext,
        authorname,
        authorurl,
        authoricon,
        image,
        footericon,
        channelid,
        color
      } = req.body;

      const fields = [];
      let loop = true;
      let i = 0;
      while(loop){
        if(req.body[`field[${i}][title]`]){
            fields.push({
                name: req.body['field[0][title]'],
                value: req.body['field[0][value]'],
                inline: req.body['field[0][inline]'] === 'checked' ? true : false
            })
            i++;
        }else{
            loop = false;
            break;
        }
      }

      console.log(fields);

      if (!this.checkToken(token)) return;

      const embed = {
          color,
        title,
        description,
        fields,
        author: {
          name: authorname,
          url: authorurl,
          icon_url: authoricon,
        },
        thumbnail: {
          url: thumbnail,
        },
        footer: {
          text: footertext,
          icon_url: footericon,
        },
        image: {
            url: image
        },
      };

      const channel = this.client.guilds.cache
        .first()
        .channels.cache.get(channelid);
      if (channel) {
        channel.send({ embed });
      }
    });
  }
}

module.exports = WebSocket;
