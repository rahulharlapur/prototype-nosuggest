(function () {
  /*
   * Manually maintained YouTube sample catalogue.
   * These entries use public YouTube IDs and thumbnails. No API is called and
   * this list does not automatically refresh when channels publish new videos.
   */
  const youtubeCatalog = [
    {
      localId: "mkbhd-roadster",
      youtubeId: "scwlR0QHGOk",
      title: "The NEW Tesla Roadster: My Honest Reaction",
      channel: "Marques Brownlee",
      channelId: "UCBJycsmduvYEL83R_U4JriQ",
      duration: "22:45",
      seconds: 1365,
      uploadDate: "",
    },
    {
      localId: "mkbhd-homeview",
      youtubeId: "QVv3mQzlrN0",
      title: "Apple Homeview Impressions: Not Convinced!",
      channel: "Marques Brownlee",
      channelId: "UCBJycsmduvYEL83R_U4JriQ",
      duration: "11:47",
      seconds: 707,
      uploadDate: "",
    },
    {
      localId: "mkbhd-googlebook",
      youtubeId: "_0G4OG39XjI",
      title: "WTF is a Googlebook?",
      channel: "Marques Brownlee",
      channelId: "UCBJycsmduvYEL83R_U4JriQ",
      duration: "14:12",
      seconds: 852,
      uploadDate: "",
    },
    {
      localId: "mkbhd-pixel",
      youtubeId: "3iRUwVzRDZQ",
      title: "Google Pixel: a thoughtful first look",
      channel: "Marques Brownlee",
      channelId: "UCBJycsmduvYEL83R_U4JriQ",
      duration: "10:47",
      seconds: 647,
      uploadDate: "",
    },
    {
      localId: "bb-dhindora",
      youtubeId: "WqsI8wY42sM",
      title: "Dhindora 2 | Official Announcement",
      channel: "BB Ki Vines",
      channelId: "UCqwUrj10mAEsqezcItqvwEw",
      duration: "2:04",
      seconds: 124,
      uploadDate: "",
    },
    {
      localId: "bb-din-hagna",
      youtubeId: "-6fk3PXpznY",
      title: "BB Ki Vines - Din Hagna Da",
      channel: "BB Ki Vines",
      channelId: "UCqwUrj10mAEsqezcItqvwEw",
      duration: "8:36",
      seconds: 516,
      uploadDate: "",
    },
    {
      localId: "bb-taaza-khabar",
      youtubeId: "yYF6basS7mg",
      title: "Taaza Khabar | Season 2 | Official Trailer",
      channel: "BB Ki Vines",
      channelId: "UCqwUrj10mAEsqezcItqvwEw",
      duration: "1:59",
      seconds: 119,
      uploadDate: "",
    },
    {
      localId: "bb-dramatic",
      youtubeId: "nLINrlaH-oc",
      title: "BB Ki Vines: a character comedy selection",
      channel: "BB Ki Vines",
      channelId: "UCqwUrj10mAEsqezcItqvwEw",
      duration: "0:40",
      seconds: 40,
      uploadDate: "",
    },
    {
      localId: "bwf-court-4",
      youtubeId: "EI4dLai6Weo",
      title: "YONEX French Open 2026 | Day 2 | Court 4",
      channel: "BWF TV",
      channelId: "UChh-akEbUM8_6ghGVnJd6cQ",
      duration: "Live/varies",
      seconds: 0,
      uploadDate: "",
    },
    {
      localId: "bwf-court-3",
      youtubeId: "sOstk4PYprQ",
      title: "YONEX French Open 2026 | Day 2 | Court 3",
      channel: "BWF TV",
      channelId: "UChh-akEbUM8_6ghGVnJd6cQ",
      duration: "Live/varies",
      seconds: 0,
      uploadDate: "",
    },
    {
      localId: "bwf-court-2",
      youtubeId: "w5_BNjF3e1E",
      title: "YONEX French Open 2026 | Day 2 | Court 2",
      channel: "BWF TV",
      channelId: "UChh-akEbUM8_6ghGVnJd6cQ",
      duration: "Live/varies",
      seconds: 0,
      uploadDate: "",
    },
    {
      localId: "bwf-doubles",
      youtubeId: "bBvNIxqA4v4",
      title: "YONEX French Open 2026 | Koga/Saito vs Christiansen/Bøje",
      channel: "BWF TV",
      channelId: "UChh-akEbUM8_6ghGVnJd6cQ",
      duration: "Live/varies",
      seconds: 0,
      uploadDate: "",
    },
  ];

  const channelInfo = {
    mkbhd: {
      name: "Marques Brownlee",
      creator: "Marques Brownlee",
      initials: "MB",
      description: "Thoughtful reviews and conversations about technology.",
    },
    "bb-ki-vines": {
      name: "BB Ki Vines",
      creator: "Bhuvan Bam",
      initials: "BB",
      description: "Character comedy and entertainment from Bhuvan Bam.",
    },
    "bwf-tv": {
      name: "BWF TV",
      creator: "BWF TV",
      initials: "BW",
      description: "Badminton matches, analysis, and tournament coverage.",
    },
  };
  const channelIds = {
    mkbhd: "UCBJycsmduvYEL83R_U4JriQ",
    "bb-ki-vines": "UCqwUrj10mAEsqezcItqvwEw",
    "bwf-tv": "UChh-akEbUM8_6ghGVnJd6cQ",
  };
  const colors = { mkbhd: "four", "bb-ki-vines": "five", "bwf-tv": "six" };
  const topics = {
    mkbhd: "Technology",
    "bb-ki-vines": "Comedy",
    "bwf-tv": "Badminton",
  };
  const videos = youtubeCatalog.map((source, index) => {
    const channelId = Object.keys(channelIds).find(
      (id) => channelIds[id] === source.channelId,
    );
    const info = channelInfo[channelId];
    return {
      id: source.localId,
      title: source.title,
      channelId,
      channel: info.name,
      creator: info.creator,
      topic: topics[channelId],
      duration: source.duration,
      seconds: source.seconds,
      date: source.uploadDate,
      description: `A manually selected ${topics[channelId].toLowerCase()} video from ${info.name}.`,
      avatar: info.initials,
      thumb: colors[channelId],
      youtubeId: source.youtubeId,
      thumbnail: `https://i.ytimg.com/vi/${source.youtubeId}/mqdefault.jpg`,
      youtubeTitle: source.title,
      youtubeChannel: source.channel,
      youtubeChannelId: source.channelId,
      youtubeDuration: source.duration,
      youtubeUploadDate: source.uploadDate,
      comments: [],
      catalogueOrder: index,
    };
  });
  const channels = Object.keys(channelInfo).map((id) => ({
    id,
    channelId: channelIds[id],
    ...channelInfo[id],
  }));
  window.NoSuggestData = { videos, channels, youtubeCatalog };
})();
