Uglify JS Middleware
====================

This library is an extension for the [Uglify JS][1] library to add middleware
for simple use with the [Connect][2] library to automatically uglify your JS
whenever a source file has been updated.

You can install the library through the Node Package Manager by running
`npm install uglify-js-middleware`.

    var uglify = require('uglify-js');
    require('uglify-js-middleware');
    
    //app setup...
    
    app.use(uglify.middleware({
      src : __dirname + '/public/javascripts',
      uglyext: 1
    }));

If you are not already using `uglify`, the `require()` of this library will
return the middleware function directly.

Once in place, you can now develop pretty source.js code and call source.ugly.js within the html script tag to generate and serve uglify -ed javascript.

Configuration
-------------

The following options are supported:

 * `src`: Source directory of JavaScript files.
 * `dest`: Destination directory to place uglified files. If omitted, this will
   default to match `src` and your generated files will be suffixed with
   `.ugly.js` rather than just `.js`.
 * `force`: Boolean indicating whether to force uglification to occur on every
   access.
 * `mangle`: Boolean indicating whether variable names should be mangled.
 * `squeeze`: Boolean indicating whether the code should be squeezed.
 * `uglyext`: Boolean indicating whether to use the `.ugly.js` extension for
   generated files.



Developed By
============

* Jake Wharton - <jakewharton@gmail.com>



License
=======

    Copyright 2012 Jake Wharton

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.




 [1]: https://github.com/mishoo/UglifyJS
 [2]: http://senchalabs.github.com/connect/
