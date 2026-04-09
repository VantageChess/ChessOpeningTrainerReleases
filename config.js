const latestVersion = "1.4.2";
const owner = "VantageChess";
const repo = "ChessOpeningTrainerReleases";

window.APP_CONFIG = {
  appName: "Chess Opening Trainer",
  shortDescription: "A desktop app for drilling chess opening repertoires.",
  github: {
    owner: owner,
    repo: repo,
    latestVersion: "v" + latestVersion,
    releasesUrl: "https://github.com/" + owner + "/" + repo + "/releases",
  },
  assets: {
    macos: "chess-opening-trainer-" + latestVersion + ".dmg",
    linuxDeb: "chess-opening-trainer_" + latestVersion + "_amd64.deb",
    linuxAppImage: "chess-opening-trainer-" + latestVersion + ".AppImage",
    windows: "",
  },
  support: {
    contactLabel: "",
    contactUrl: "",
  },
  screenshots: [
    {
      title: "Training Session",
      description: "",
      image: "assets/screenshots/chess-opening-trainer.png",
    },
  ],
  footer: {
    copyrightText: "Chess Opening Trainer",
  },
};
