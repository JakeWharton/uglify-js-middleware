/**
 * Module dependencies.
 */

var uglify = require('uglify-js');

var jsp = uglify.parser
  , pro = uglify.uglify
  , fs = require('fs')
  , url = require('url')
  , basename = require('path').basename
  , dirname = require('path').dirname
  , mkdirp = require('mkdirp')
  , join = require('path').join
  , async = require('async')
  , ENOENT = 'ENOENT';

// COMPAT:

/**
 * Return Connect middleware with the given `options`.
 *
 * Implementation derived from the Stylus library middleware.
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */  

module.exports = uglify.middleware = function(options) {
  options = options || {};

  //Accept src/dest dir
  if ('string' === typeof options) {
    options = { src: options };
  }

  // Force compilation
  var force = options.force || false;

  // Variable name mangling
  var mangle = options.mangle || true;

  // Code squeezing
  var squeeze = options.squeeze || true;
  
  // ugly extension
  var uglySuffix = options.uglySuffix || '.ugly.js';

  // Source dir required
  var src = options.src;
  if (!src) throw new Error('uglify.middleware requires "src" directory');

  // Default dest dir to source
  var dest = options.dest
    ? options.dest
    : src;

  // Whether to "ugly" the extension (default true if same dirs, else false)
  var uglyext = options.uglyext || (src === dest);
  var suffix = uglyext ? uglySuffix : '.js';

  // defined groups for concating files
  var groups = options.groups || {};

  return function(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();

    // pathname w/o the first /
    var path = url.parse(req.url).pathname.substr(1);

    if (path.indexOf(suffix, -suffix.length) !== -1) {
      // setup of what we're gonna do
      // - a single file, or;
      // - multiple files
      var uglyPath = join(dest, path)
        , jsPath = uglyext ? path.replace(uglySuffix, '.js') : path
        , group = groups[path] || groups['/' + path] || [jsPath]
        , files = group.map(function(file) {
            return join(src, file);
          });

      // error helper function
      function error(err) {
        next(ENOENT === err.code ? null : err);
      }

      // check the stat of all the files
      async.map(files, fs.stat, function(err, rs) {
        // one of the files gives us an error
        if (err) {
          error(err);
        } else if (force) {
          compile();
        } else {
          // check the output file
          fs.stat(uglyPath, function(err, uglyStats) {
            if (err) {
              // output file doesn't exist, compile it
              if (ENOENT === err.code) {
                compile();
              } else {
                next();
              }
            } else {
              // compare mtimes between source files and the output file
              var recompile = rs.some(function(stat) {
                return stat.mtime > uglyStats.mtime;
              });

              if (recompile) {
                compile();
              } else {
                next();
              }
            }
          });
        }
      });

      // Compile to uglyPath
      function compile() {
        // compile all the files one by one
        async.map(files, function(file, cb) {
          fs.readFile(file, 'utf8', function(err, contents) {
            if (err) {
              error(err);
            } else {
              // compile the file with uglify-js with some uglify options
              try {
                var ast = jsp.parse(contents);

                if (mangle) {
                  ast = pro.ast_mangle(ast);
                }

                if (squeeze) {
                  ast = pro.ast_squeeze(ast);
                }

                cb(null, pro.gen_code(ast));
              } catch (ex) {
                // no, can't do
                return cb(ex);
              }
            }
          });
        }, function(err, rs) {
          if (err) {
            error(err);
          } else {
            // create directory and ...
            mkdirp(dirname(uglyPath), 0700, function(err) {
              if (err) {
                error(err);
              } else {
                // .. save the new file
                fs.writeFile(uglyPath, rs.join(';'), 'utf8', next);
              }
            });
          }
        });
      }
    } else {
      next();
    }
  };
};