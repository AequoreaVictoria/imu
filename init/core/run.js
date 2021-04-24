const fs = require("fs");
const path = require("path");

const currentCommand = process.argv[2];
const commands = ["new", "reset", "client-debug", "client-release"];

let validCommand = false;
for (let i = 0; i < commands.length; i++) {
  if (currentCommand === commands[i]) {
    validCommand = true;
    break;
  }
}
if (process.argv.length === 2) validCommand = true; // Allow default command.

if (!validCommand) {
  console.info(
    "USAGE: \n" +
      "    imu new [options]\n" +
      "        Create new projects and templates. Use command for more details.\n" +
      "    imu client-debug [DEFAULT]\n" +
      "        Builds the client in debug mode.\n" +
      "    imu client-release\n" +
      "        Builds the client in release mode.\n" +
      "    imu reset\n" +
      "        Clears all build artifacts. Used for troubleshooting.\n"
  );
  process.exit(1);
}

function hasTup() {
  const envPath = process.env.PATH || "";
  const envExt = process.env.PATHEXT || "";
  const paths = envPath
    .replace(/["]+/g, "")
    .split(path.delimiter)
    .map((dir) =>
      envExt.split(path.delimiter).map((ext) => path.join(dir, "tup" + ext))
    )
    .reduce((a, b) => a.concat(b));
  for (let i = 0; i < paths.length; i++) {
    try {
      if (fs.statSync(paths[i]).isFile()) return true;
    } catch (e) {
      /* Keep looping... */
    }
  }
  console.info("--- Building without tup!");
  return false;
}

switch (currentCommand) {
  case "new": {
    require("./cmd/new")();
    break;
  }
  case "reset": {
    require("./cmd/reset")();
    break;
  }
  case "client-release":
  case "client-debug":
  default: {
    if (hasTup("tup"))
      require("./cmd/tup")(currentCommand ? currentCommand : "client-debug");
    else
      require("./cmd/tupless")(
        currentCommand ? currentCommand : "client-debug"
      );
  }
}

process.exit(0);
