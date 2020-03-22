import { printLine } from './modules/print';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine('Using a function from the Print Module');

function start() {
  const opts = {
    accepts: [
      {
        description: 'Text file',
        extensions: ['txt'],
        mimeTypes: ['text/plain'],
      },
    ],
  };

  window.chooseFileSystemEntries(opts).then((handle) => {
    // Select the node that will be observed for mutations
    const targetNode = document.getElementsByClassName(
      'playControls__soundBadge'
    )[0];

    // Options for the observer (which mutations to observe)
    var config = { childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    var callback = function(mutationsList, observer) {
      console.log('mutation');
      const text = document
        .getElementsByClassName('playbackSoundBadge__titleContextContainer')[0]
        .innerText.replace('Titre en cours : ', '')
        .split('\n');

      const textParsed = text[1] + ' par ' + text[0];

      async function writeFile(fileHandle, contents) {
        // Create a writer (request permission if necessary).
        const writer = await fileHandle.createWriter();
        // Write the full length of the contents
        await writer.write(0, contents);
        // Close the file and write the contents to disk
        await writer.close();
      }

      writeFile(handle, textParsed);
    };

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    callback();
  });

  removeEventListener('click', start);
}

addEventListener('click', start);
