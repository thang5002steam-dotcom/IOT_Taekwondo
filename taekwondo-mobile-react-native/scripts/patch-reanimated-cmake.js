const fs = require('fs');
const path = require('path');

if (process.platform !== 'win32') process.exit(0);

const buildFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-reanimated',
  'android',
  'build.gradle.kts',
);
const marker = '"-DCMAKE_OBJECT_PATH_MAX=200",';
const anchor = '"-DANDROID_TOOLCHAIN=clang",';
const stagingMarker = 'buildStagingDirectory = rootProject.file(".cxx/reanimated")';
const stagingAnchor = 'path = file("CMakeLists.txt")';

const faceDetectorBuildFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-vision-camera-face-detector',
  'android',
  'build.gradle',
);

if (!fs.existsSync(buildFile)) process.exit(0);

const source = fs.readFileSync(buildFile, 'utf8');
if (!source.includes(anchor) || !source.includes(stagingAnchor)) {
  console.error('[patch-reanimated-cmake] Could not find the expected CMake configuration.');
  process.exitCode = 1;
} else {
  let patched = source;
  if (!patched.includes(marker)) {
    patched = patched
      .replace(/\s*"-DCMAKE_OBJECT_PATH_MAX=\d+",/, '')
      .replace(anchor, `${anchor}\n                    ${marker}`);
  }
  if (!patched.includes(stagingMarker)) {
    patched = patched.replace(stagingAnchor, `${stagingAnchor}\n            ${stagingMarker}`);
  }
  if (patched !== source) {
    fs.writeFileSync(buildFile, patched);
    console.log('[patch-reanimated-cmake] Shortened Reanimated CMake build paths on Windows.');
  }
}

if (fs.existsSync(faceDetectorBuildFile)) {
  const faceSource = fs.readFileSync(faceDetectorBuildFile, 'utf8');
  const faceCmakeAnchor =
    'arguments "-DANDROID_STL=c++_shared", "-DANDROID_SUPPORT_FLEXIBLE_PAGE_SIZES=ON"';
  const faceCmakePatched = `${faceCmakeAnchor}, "-DCMAKE_OBJECT_PATH_MAX=200"`;
  const faceStagingAnchor = 'path "CMakeLists.txt"';
  const faceStagingMarker =
    'buildStagingDirectory rootProject.file(".cxx/vision-camera-face-detector")';
  const kotlinPlugin = "apply plugin: 'org.jetbrains.kotlin.android'";
  const guardedKotlinPlugin = `// AGP 9 already registers the Kotlin extension. Applying the plugin twice fails.\nif (project.extensions.findByName('kotlin') == null) {\n  ${kotlinPlugin}\n}`;

  if (!faceSource.includes(faceCmakeAnchor) || !faceSource.includes(faceStagingAnchor)) {
    console.error(
      '[patch-reanimated-cmake] Could not find the expected Vision Camera face detector configuration.',
    );
    process.exitCode = 1;
  } else {
    let facePatched = faceSource;
    if (!facePatched.includes('-DCMAKE_OBJECT_PATH_MAX=')) {
      facePatched = facePatched.replace(faceCmakeAnchor, faceCmakePatched);
    }
    if (!facePatched.includes(faceStagingMarker)) {
      facePatched = facePatched.replace(
        faceStagingAnchor,
        `${faceStagingAnchor}\n      ${faceStagingMarker}`,
      );
    }
    if (
      facePatched.includes(kotlinPlugin) &&
      !facePatched.includes("project.extensions.findByName('kotlin')")
    ) {
      facePatched = facePatched.replace(kotlinPlugin, guardedKotlinPlugin);
    }
    if (facePatched !== faceSource) {
      fs.writeFileSync(faceDetectorBuildFile, facePatched);
      console.log(
        '[patch-reanimated-cmake] Patched Vision Camera face detector for AGP 9 and short Windows CMake paths.',
      );
    }
  }
}
