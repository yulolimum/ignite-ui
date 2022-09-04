import { simpleGit, SimpleGit, SimpleGitOptions } from "simple-git";
import cliArgs from "command-line-args";
import fs, { tmpDir } from "fs-jetpack";

const GIT_DEFAULT_BRANCH = "master";
const GIT_REPO = "git@github.com:infinitered/ignite.git";
const CLI_OPTIONS: cliArgs.OptionDefinition[] = [
  {
    name: "branch",
    alias: "b",
    type: String,
    defaultValue: GIT_DEFAULT_BRANCH,
    defaultOption: true,
  },
];
const GLOBS = [
  "boilerplate/app/components{,/*.{ts,tsx}}",
  "boilerplate/app/theme{,/*.ts}",
  "boilerplate/app/i18n{,/*.ts}",
  "boilerplate/assets/icons{,/*.png}",
];

(async function () {
  const igniteFs = fs.tmpDir();
  const localFs = fs;
  const git = simpleGit({ baseDir: igniteFs.cwd(), trimmed: true });
  const args = cliArgs(CLI_OPTIONS);

  try {
    await git.clone(GIT_REPO, igniteFs.cwd(), [`-b`, args.branch]);
  } catch (error) {
    console.error("Could not clone repo", error);
    return;
  }

  const itemsToCopy = igniteFs.find({
    matching: GLOBS,
    directories: true,
    files: true,
  });

  itemsToCopy.forEach((item) => {
    const isDirectory = igniteFs.exists(item) === "dir";

    if (!isDirectory) return;

    localFs.dir([localFs.cwd(), item].join("/").replace("boilerplate", "src"));
  });

  itemsToCopy.forEach((item) => {
    const isDirectory = igniteFs.exists(item) === "dir";

    if (isDirectory) return;

    igniteFs.move(
      item,
      [localFs.cwd(), item].join("/").replace("boilerplate", "src"),
      { overwrite: true }
    );
  });

  igniteFs.remove();

  console.log("Done!");
})();
