const pngToIco = require('png-to-ico').default || require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    const buffer = await pngToIco([
      path.join(__dirname, 'public', 'favicon.png'),
      path.join(__dirname, 'public', 'favicon-64.png')
    ]);
    
    fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), buffer);
    console.log('Generated favicon.ico successfully!');
  } catch (error) {
    console.error('Error generating favicon.ico:', error);
  }
}

generateFavicon();