const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'node_modules', 'reicon-react-native', 'package.json');

if (fs.existsSync(pkgPath)) {
  try {
    const content = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(content);

    if (pkg.exports && pkg.exports['./icons/*']) {
      let modified = false;

      if (pkg.exports['./icons/*'].import === './icons/*.js') {
        pkg.exports['./icons/*'].import = './icons/*';
        modified = true;
      }
      if (!pkg.exports['./icons/*'].default) {
        pkg.exports['./icons/*'].default = './icons/*';
        modified = true;
      }
      if (!pkg.exports['.'].default) {
        pkg.exports['.'].default = './index.js';
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
        console.log('[patch-reicon] Patched reicon-react-native package.json exports for Metro compatibility.');
      }
    }
  } catch (err) {
    console.error('[patch-reicon] Failed to patch reicon-react-native package.json:', err);
  }
}
