const fs = require("fs");
const path = require("path");

module.exports = {
  name: "playlist",
  description: "",
  aliases: [],
  category: "games",
  args: false,
  image:
    "https://seeklogo.com/images/M/minecraft-logo-5EAD3A1535-seeklogo.com.png",
  usage: "",
  guildOnly: true,
  cooldown: 0,
  loaded_playlists: {},
  init(client) {
    this.playlist_file = path.join(
      client.folders.modules,
      "music",
      "playlists.json"
    );

    if (!fs.existsSync(this.playlist_file)) {
      fs.writeFileSync(this.playlist_file, "{}");
    }
  },
  execute(message, args, client) {
    if (!args.length) {
      let playlists = this.getPlaylists(message.author);
      if (playlists) {
        return message.reply(playlists.map((p) => p.name).join("\n"));
      } else return message.reply("No playlists found.");
    }

    let playlist_name = null,
      playlist = null;

    switch (args[0]) {
      case "create":
        if (!args[1])
          return message.reply(
            "You need to give a name for the new playlist, eg `!playlist create music`"
          );

        if (this.createPlaylist(args[1], message.author))
          return message.reply("Playlist Created");
        else return message.reply("Error; playlist exists.");

      case "add":
        if (!args[1])
          return message.reply(
            "You didn't give a YouTube url, eg. `!playlist add <url>`"
          );

        playlist_name = args[2] || this.loaded_playlists[message.author.id];

        if (!playlist_name)
          return message.reply(
            "You didn't give a playlist name and there is no playlist loaded, eg. `!playlist add <url> <playlist_name>`"
          );

        const song_url = args[1];

        let playlists = this.getPlaylists();

        if (!this.getPlaylist(playlist_name, message.author)) {
          this.createPlaylist(playlist_name, message.author, [song_url]);
          return message.reply("Playlist did not exists, I have created it.");
        }

        playlists[message.author.id] = playlists[message.author.id].map((p) => {
          if (p.name.toLowerCase() === playlist_name.toLowerCase()) {
            p.songs.push(song_url);
            return p;
          }

          return p;
        });

        message.reply("Song added.");
        return fs.writeFileSync(
          this.playlist_file,
          JSON.stringify(playlists, null, 4)
        );

      case "load":
        if (!args[1])
          return message.reply(
            "You didn't give a playlist name, eg. `!playlist load <playlist name>`."
          );

        playlist = this.getPlaylist(args[1], message.author);

        if (!playlist) return message.reply("Playlist does not exist.");

        this.loaded_playlists[message.author.id] = playlist.name;

        return message.reply(`Playlist \`${playlist.name}\` loaded.`);

      case "play":
        playlist_name = args[1] || this.loaded_playlists[message.author.id];

        if (!playlist_name)
          return message.reply(
            "You didn't give a playlist name and there is no playlist loaded, eg. `!playlist play <playlist_name>`"
          );

        playlist = this.getPlaylist(playlist_name, message.author);

        if (!playlist) return message.reply("Playlist does not exist.");

        client.music.playCustomPlaylist(message, playlist.songs, {
          name: playlist.name,
        });
    }
  },
  getPlaylists(user = null) {
    let playlists = require(this.playlist_file);

    return !user ? playlists : playlists[user.id] || null;
  },
  getPlaylist(playlist, user) {
    const playlists = this.getPlaylists(user);

    if (playlists) {
      let pls = playlists.filter(
        (p) => p.name.toLowerCase() === playlist.toLowerCase()
      );
      if (pls.length > 0) return pls[0];
    }

    return null;
  },
  createPlaylist(name, user, songs = []) {
    const playlists = this.getPlaylists();

    if (!playlists[user.id]) playlists[user.id] = [];
    if (
      playlists[user.id].filter(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      ).length > 0
    )
      return false;

    playlists[user.id].push({
      name,
      songs,
      created: Date.now(),
    });

    fs.writeFileSync(this.playlist_file, JSON.stringify(playlists, null, 4));

    return true;
  },
};
