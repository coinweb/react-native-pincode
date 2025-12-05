const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Add TypeScript extensions
config.resolver.sourceExts.push("ts", "tsx");

// Watch the parent directory so Metro can resolve the local package
config.watchFolders = [monorepoRoot];

// Configure resolver to handle parent directory resolution
const { resolver } = config;

// Put example's node_modules FIRST so React resolves from there
resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules"), path.resolve(monorepoRoot, "node_modules")];

// Force React to always resolve from example's node_modules
resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules", "react"),
  "react/jsx-runtime": path.resolve(projectRoot, "node_modules", "react/jsx-runtime"),
  "react-dom": path.resolve(projectRoot, "node_modules", "react-dom"),
};

// Custom resolver to intercept React imports and force resolution from example's node_modules
const originalResolveRequest = resolver.resolveRequest;
const exampleNodeModules = path.resolve(projectRoot, "node_modules");
const fs = require("fs");

resolver.resolveRequest = (context, moduleName, platform) => {
  // Force React-related modules to resolve from example's node_modules
  if (
    moduleName === "react" ||
    moduleName === "react/jsx-runtime" ||
    moduleName === "react/jsx-dev-runtime" ||
    moduleName.startsWith("react/")
  ) {
    // Try to resolve from example's node_modules
    const reactModulePath = path.join(exampleNodeModules, moduleName);
    const reactPackageJson = path.join(reactModulePath, "package.json");

    if (fs.existsSync(reactPackageJson)) {
      // Read package.json to find the main entry point
      try {
        const pkg = JSON.parse(fs.readFileSync(reactPackageJson, "utf8"));
        const mainFile = pkg.main || "index.js";
        const mainPath = path.join(reactModulePath, mainFile);

        if (fs.existsSync(mainPath)) {
          return {
            filePath: mainPath,
            type: "sourceFile",
          };
        }
      } catch (e) {
        // Fall through
      }
    }

    // For react/jsx-runtime, try the specific file
    if (moduleName === "react/jsx-runtime" || moduleName === "react/jsx-dev-runtime") {
      const jsxRuntimePath = path.join(exampleNodeModules, "react", moduleName.replace("react/", "") + ".js");
      if (fs.existsSync(jsxRuntimePath)) {
        return {
          filePath: jsxRuntimePath,
          type: "sourceFile",
        };
      }
    }
  }

  // Use default resolution for other modules
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
