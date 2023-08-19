const fs = require('fs');
const os = require('os');

const CLONE_HERO_SONGS_DIR = os.homedir() + '/Clone Hero/Songs/';

async function main() {
  console.log('GuitarHeroCleaner');
  
  try {
    const cloneHeroSongsFolder = fs.readdirSync(CLONE_HERO_SONGS_DIR, {withFileTypes: true});
    cloneHeroSongsFolder.forEach((file, index) => {
      // limit number of folders crawled
      if (index > 6 && process.argv.includes('-testRun')) {
        return;
      }
     recursiveReadAndDelete(file, CLONE_HERO_SONGS_DIR + file.name);
    })
  } catch (err) {
    console.log(err.message);
  }
}

main();

function recursiveReadAndDelete(handle, path) {
  if (handle.isFile()) {
    if (handle.name === 'song.ini') {
      readHandleSongIni(path);
    }
    return;
  }
  
  const files = fs.readdirSync(path, {withFileTypes: true});

  files.forEach(fileHandle => recursiveRead(fileHandle, `${path}/${fileHandle.name}`));  
}

function readHandleSongIni(filepath) {
  // some song.ini files don't appear to be utf8, they spit out a bunch of unicdoe symbols...
  const file = fs.readFileSync(filepath, 'utf8');
  const songProperties = parseSongIni(file);
  handleSongIni(songProperties, () => handleGhlSong(filepath), () => handleNonGhlSong(filepath));
}

// Ghl song == guitar hero live songs (6 fret guitar)
function handleGhlSong(filepath) {
  if (process.argv.includes('-dryRun')) {
    console.log(`${filepath} has GHL support - it will be deleted on a non-dry run`);
    console.log(`run with -destructive arg to delete files`);
  }
  else if (process.argv.includes('-destructive')) {
    const folderpath = filepath.replace('\/song.ini', '');
    console.log(`deleting ${folderpath}..`);
    deleteFolderRecursive(folderpath, () => {
      console.log(`${folderpath} was deleted`);
    });
  }
}

// @TODO, not needed at the moment
// Non Ghl song == guitar hero songs (5 fret guitar)
function handleNonGhlSong(filepath) {
  // console.log(`${filepath} does not have GHL support - good to go!`);
}

function handleSongIni(songProperties, onGhlCallback, onNotGhlCallback) {
  // -1 seems to indicate it is disabled or not supported
  const supportsGhlGuitar = songProperties.diff_guitarghl > -1;
  const supportsGhlBass = songProperties.diff_bassghl > -1;
  const supportsRockband = songProperties.diff_band > -1;
  const supportsGh = songProperties.diff_guitar > -1;
  if (supportsGhlGuitar || supportsGhlBass) {
    // in this case, not having band or guitar support would suggest the song only has GHL options
    if (!supportsRockband && !supportsGh) {
      console.log({
        name: songProperties.name,
        ghl: `${songProperties.diff_bassghl} | ${songProperties.diff_guitarghl}`,
        clonehero: `${songProperties.diff_band} | ${songProperties.diff_guitar}`
      })
      onGhlCallback();
    }
  } else {
    onNotGhlCallback();
  }
}

// assumed format is [song] followed by key/value pairs delimited by =
function parseSongIni(file) {
  let properties = {}
  const splitFile = file.trim().split('\r\n');
  splitFile.filter(key => key.toLowerCase() !== '[song]')
  .forEach(property => {
    const [k, v] = property.split('=');
    properties[k.trim()] = (v && v.length) ? v.trim() : '';
  })

  return properties;
}

// ran into a consistent error using fs.unlink
// turns out you can't unlink folders
// error: eperm: operation not permitted unlink
// adapted from stack overflow https://stackoverflow.com/questions/8496212/node-js-fs-unlink-function-causes-eperm-error/20920795
function deleteFolderRecursive(path, callback) {
  if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach((file) => {
        var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
      callback();
    }
};