exports.page = (req, res, client) => {
  const _token = req.query.token;

  const channels = [];
  client.bot.guilds.cache
    .first()
    .channels.cache.filter((c) => c.type === "text")
    .forEach((c) => {
      channels.push({ id: c.id, name: c.name });
    });

  res.render("messages", { title: "Messages", token: _token, channels });
};

exports.sendNormalMessage = (req, res, client) => {
  var message = req.body.message;
  var channelid = req.body.channelid;

  console.log('Sending...');

  const channel = client.bot.guilds.cache.first().channels.cache.get(channelid);
  if (channel) {
    channel.send(message);
  }
};

exports.sendEmbedMessage = (req, res, client) => {
  const {
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
    color,
  } = req.body;

  const fields = [];
  let loop = true;
  let i = 0;
  while (loop) {
    if (req.body[`field[${i}][title]`]) {
      fields.push({
        name: req.body["field[0][title]"],
        value: req.body["field[0][value]"],
        inline: req.body["field[0][inline]"] === "checked" ? true : false,
      });
      i++;
    } else {
      loop = false;
      break;
    }
  }

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
      url: image,
    },
  };

  const channel = client.bot.guilds.cache
    .first()
    .channels.cache.get(channelid);
  if (channel) {
    channel.send({ embed });
  }
};
