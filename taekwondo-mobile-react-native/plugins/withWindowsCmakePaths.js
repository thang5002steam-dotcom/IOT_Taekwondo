const { withAppBuildGradle } = require('@expo/config-plugins');

const STAGING_MARKER =
  'buildStagingDirectory(System.getProperty("os.name").toLowerCase().contains("windows") ? new File(rootProject.projectDir.toPath().getRoot().toFile(), ".cxx/tkd-app") : rootProject.file(".cxx/app"))';
// Keep this below Windows' 260-character path limit while leaving enough
// room for CMake's hashed object-file suffixes.
const OBJECT_PATH_MARKER = 'arguments "-DCMAKE_OBJECT_PATH_MAX=240"';
const KOTLIN_PLUGIN = 'apply plugin: "org.jetbrains.kotlin.android"';

module.exports = function withWindowsCmakePaths(config) {
  return withAppBuildGradle(config, (modConfig) => {
    if (modConfig.modResults.language !== 'groovy') {
      throw new Error('withWindowsCmakePaths only supports Groovy app/build.gradle files.');
    }

    let source = modConfig.modResults.contents;

    if (
      source.includes(KOTLIN_PLUGIN) &&
      !source.includes("project.extensions.findByName('kotlin')")
    ) {
      source = source.replace(
        KOTLIN_PLUGIN,
        `// AGP 9 already registers the Kotlin extension.\nif (project.extensions.findByName('kotlin') == null) {\n    ${KOTLIN_PLUGIN}\n}`,
      );
    }

    if (!source.includes(STAGING_MARKER)) {
      source = source.replace(
        'android {',
        `android {\n    // Keep native build output short enough for Ninja on Windows.\n    externalNativeBuild {\n        cmake {\n            ${STAGING_MARKER}\n        }\n    }`,
      );
    }

    if (!source.includes(OBJECT_PATH_MARKER)) {
      source = source.replace(
        '    defaultConfig {',
        `    defaultConfig {\n        externalNativeBuild {\n            cmake {\n                ${OBJECT_PATH_MARKER}\n            }\n        }`,
      );
    }

    if (!source.includes(STAGING_MARKER) || !source.includes(OBJECT_PATH_MARKER)) {
      throw new Error('Could not patch the Android app CMake configuration.');
    }

    modConfig.modResults.contents = source;
    return modConfig;
  });
};
