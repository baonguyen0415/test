// generated on 2020-05-29 using generator-webapp 4.0.0-5
const { src, dest, watch, series, parallel, lastRun, task } = require("gulp");
const browserSync = require("browser-sync").create();
const fs = require("fs");
const { argv } = require("yargs");
const path = require("path");
const plugins = require("gulp-load-plugins")();
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const npmRun = require("npm-run");

const port = argv.port || 9000;

/**
 *------------------------ NEED TO DECLARE OPTION HERE ------------------------------------------
 */
const shopifyHost = "https://electro-6.myshopify.com/";
const password = "";
const themeID = "121082576947";
// const proxy = `${shopifyHost}`;
const proxy = `${shopifyHost}?preview_theme_id=${themeID}`;

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

async function buildScripts(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`${path.basename(filePath)} does not exist.`);
    return;
  }

  webpack(
    {
      entry: path.resolve(__dirname, filePath),
      output: {
        path: path.resolve(__dirname, "./", "theme/assets"),
        filename: path.basename(filePath),
      },
      mode: "production",
      module: {
        rules: [
          {
            test: /\.(js)$/,
            loader: "babel-loader",
            exclude: /(node_modules)/,
          },
        ],
      },
      resolve: {
        extensions: ["*", ".js"],
      },
      // devtool: "source-map",
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              format: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
      },
    },
    (err, stats) => {
      if (err || stats.hasErrors()) {
        if (err) {
          console.log("Has an error", err);
        }
        if (stats.compilation.errors) {
          console.log(stats.compilation.errors);
        }
      } else {
        console.log(`${path.basename(filePath)}: Finish`);
      }
    },
  );
}

function scriptTask(filePath) {
  let fileName = path.basename(filePath, ".js");
  let sourceTree = JSON.parse(fs.readFileSync("./app.config.json"));

  if (sourceTree["only"].length > 0) {
    sourceTree.only.forEach((item) => {
      let filePath = "app/scripts/" + item + ".js";
      buildScripts(filePath);
    });
  } else {
    Object.keys(sourceTree)
      .filter((item) => {
        if (item === "only") {
          return false;
        }
        return sourceTree[item].indexOf(fileName) != -1;
      })
      .map((item) => {
        let filePath = "app/scripts/" + item + ".js";
        buildScripts(filePath);
      });
  }
}

async function removeScript(filePath) {
  fs.unlinkSync("theme/assets/" + path.basename(filePath));
  console.log("Deleted " + path.basename(filePath));
}

async function startServer() {
  browserSync.init({
    proxy,
    port,
    snippetOptions: {
      // Provide a custom Regex for inserting the snippet.
      rule: {
        match: /<\/body>/i,
        fn: function (snippet, match) {
          if (!!password) {
            snippet += `<script type="application/javascript">
                          if(location.href.includes('password')){
                            let input =  document.querySelector('input[type="password"]')
                            input.value = "${password}";
                            input.closest('form').submit();
                          }
                        </script>`;
          }
          snippet += "<style>#preview-bar-iframe{display: none;}</style>";
          return snippet + match;
        },
      },
    },
  });

  watch("./app/scripts/common/**/*.js").on("change", scriptTask);
  watch("./app/scripts/*.js").on("change", buildScripts);
  watch("./app/scripts/*.js").on("unlink", removeScript);
  watch(".tmp/theme.update").on("change", debounce(browserSync.reload, 1500));
}

async function build() {
  fs.readdirSync("app/scripts/", { withFileTypes: true })
    .filter((item) => !item.isDirectory())
    .map((item) => {
      let filePath = "app/scripts/" + item.name;
      webpack(
        {
          entry: path.resolve(__dirname, filePath),
          output: {
            path: path.resolve(__dirname, "./", "theme/assets"),
            filename: path.basename(filePath),
          },
          mode: "production",
          module: {
            rules: [
              {
                test: /\.(js)$/,
                loader: "babel-loader",
                exclude: /(node_modules)/,
              },
            ],
          },
          resolve: {
            extensions: ["*", ".js"],
          },
          devtool: "source-map",
          optimization: {
            minimize: true,
            minimizer: [
              new TerserPlugin({
                terserOptions: {
                  format: {
                    comments: false,
                  },
                },
                extractComments: false,
              }),
            ],
          },
        },
        (err, stats) => {
          if (err || stats.hasErrors()) {
            if (err) {
              console.log("Has an error", err);
            }
            if (stats.compilation.errors) {
              console.log(stats.compilation.errors);
            }
          } else {
            console.log(`${path.basename(filePath)}: Finish`);
            npmRun.exec("cd theme && theme deploy --allow-live -a assets/" + item.name, function (err, stdout, stderr) {
              if (stdout) console.log(stdout);
              if (stderr) console.log(stderr);
            });
          }
        },
      );
    });
}

exports.serve = startServer;
exports.build = build;