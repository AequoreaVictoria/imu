# imu :fire: :pig: :fire:
> Incrementally build statically-linked pages and servers with tup.

## What is it? Why?
This is an opinionated build system that has made all the decisions for you.

It works with simple commands. It is incremental and runs only tasks when
needed. Eligible tasks are run in parallel. It also prevents stale files
from leaking into your deployment directory. You do not need to specify
your project dependencies for this to work, but in exchange you need to
follow the provided project layout.

It uses [tup][0] to accomplish this.

For rapid prototyping, [Stage0][1], [S.js][2] and [TailwindCSS][3] related
libraries are provided. Their use are optional and they consume roughly 3~6KB of
the compressed bundle size when optimized. You also have the option of using
the [Vue.js][24] suite instead of [Stage0][1] and [S.js][2], however this adds
about 30KB~ in size and has different performance characteristics. It is,
however, much more familiar to developers.

JavaScript is ES6, CSS is [PostCSS Preset Env][4], HTML is preprocessed, all is
aggressively minified and packed into single HTML page. It is easy to build many
pages, with as little or as much CSS and JavaScript as needed -- the natural unit
 for splitting up bundle sizes.

At around 64KB~128KB compressed, you may want to start thinking about a new page.

Reading the  `.imu` source installed into your project is a good idea. You are
encouraged to fork, modify and otherwise twist the contents to your needs.

### Requirements
* [node.js][6]

### Optional Dependencies
* `npm install --global imu-build`
* [tup][0]
* [.NET Core 3.0][7]
* [MySQL][8]

Neither [tup][0] nor `imu-build` are required to build an *imu* project. Your
end-users may always execute `npm build` in the project root to get a
release build.

#### Tup
By default, it generates [tup][0] build logic to provide the incrementing,
parallel build and deployment system.

Although it was designed to work with [tup][0], its use is optional. If it
is not found, the entire project is built as a single synchronous thread.
This is both slower, not incremental and may also result in stale artifacts in
the deployment directory, but this will allow anyone to build a project with
no additional dependencies beyond [node.js][6].

#### imu-build
This guide will assume you will have installed `imu-build` in order to use the
`imu` command from anywhere in the project tree. However, from the project
root you may always use `npm run` to execute the very same commands.

There is no default command for `npm run` by itself, however
`npm run build` will execute a release build.

You will also need to run the `new` command as `npm run new -- -p example`
with the `--` in order to pass arguments.

The `init` command is only available with `imu-build`.

## Client Overview

| Commands           | Description
|--------------------|---------------------------------------------------------
| imu init [option]  | Installs the build scripts and npm dependencies.
| imu new [options]  | Create new projects and templates.
| imu client-debug   | Builds the client in debug mode.
| imu client-release | Builds the client in release mode.

The `init` command may take an optional arguement of either `stage0` or `vue`.
If not provided, it will default to `stage0`. The following example explains
the default workflow.

``` Shell
$ npm install --global imu-build
$ mkdir (Project)
$ cd (Project)
$ imu init
$ imu new --page (PageName)
$ imu
```

This will build an empty page to confirm the toolchain is working. You may edit
the code in `client/pages/(PageName)` to further experiment.

After making changes, executing `imu` inside the project directory will rebuild
only the necessary files. For speed, this is an unoptimized build. Running
`imu client-release` will compile an optimized, ready-to-deploy build.

When you are ready to start a new component for your page:

`imu new --page (PageName) --component (ComponentName)`

You may provide the flags in either order, and in shortened form:

`imu new -p (PageName) -c (ComponentName)`

At some point, you will want to start again with a fresh page:

`imu new -p (NewPageName)`

Names should not contain spaces and should be valid as an HTML ID tag. These
commands generate a new set of files to edit inside `client/pages/(PageName)`.

### Layout
|                   | Page Structure
|-------------------|----------------------------------------------
| components/*.js   | Component code.
| license.html      | License comment tag; prepended to the page.
| root.html         | Entry point into the page's actual DOM code.
| root.css          | Entry point into the page style.
| root.js           | Entry point into the page code.

Each page is given a `components/` directory to hold component JS,
HTML templates and assorted JavaScript code specific to the page.

Most editing will be done on `root.js` and its child `components/*`. When
you need to embed resources into the actual DOM, such as inlining SVGs and
templates, you would edit `root.html`.

JS, CSS and HTML import directives will all search for paths relative to
the importing file. In addition, it will also search the subdirectories of
`client` and `client/pages`. The use of file extensions is optional except
to resolve conflicts.

The compiled page files are placed in `deploy/client`.


|                   | Project Structure
|-------------------|----------------------------------------------------
| client/pages      | Code for each application page.
| client/share      | Code shared between each application page.
| client/style      | Style code and Tailwind configuration.
| client/svg        | SVG icons available for inlining.
| client/util       | Third-party libraries used by application pages.
| deploy/client     | The destination of compiled pages.
| deploy/static     | All static files and content, available via /static
| tmp               | Temporary files created during the build process.

The `client/style` directory contains the `tailwind.config.js` file and
is a good place for stylesheets you wish to `@import` into pages. For example,
a site may consist of many pages all importing the same set of Tailwind
components. As each page has its own CSS file, you may safely place unique
classes and overrides into it without affecting the styling of other pages.

The `style/base.css` file is the project-wide style reset. It is mostly the
same as [TailwindCSS][3]'s reset, using sections of [Normalize.css][9],
[SUIT CSS][11] and [TailwindCSS][3]-specific rules. It has had a few
additional rules added, including part of [Eric Meyer][12]'s reset.

If you need to use third-party ES6 modules that are not available via `npm`,
use the `client/util` directory.

Static files should be placed in `deploy/static`. A built-in `favicon.ico`
generator will place one inside `deploy/static` if one is not present when
calling `imu new -p`. This is a 43 byte 1x1 transparent GIF image, as small
as it can be made.

A suggested directory is `client/share`, to be used for components that are
shared and imported across pages. For example, a '404 Not Found' component
may be the same across all of your pages. You will need to create the
`client/share` directory, should you choose to use it.

Other potential paths could include things such as `client/store` and
`client/api` for holding modules for [S.js][2] (or [Vuex][24]) store and API
request related abstractions. `client/router.js` could hold your application's
router configuration. These paths require no specific support from *imu*.

### Bundling
JavaScript is bundled with [Rollup.js][13], offering you ES6-level modules your
page. For release builds, [Terser][14] is used to minimize the compiled page
bundle with full ES6 support.

CSS is processed with [PostCSS][10], with [CSS Import][15] and
[PostCSS Preset Env][4], which provides a number of current CSS spec features.
[PostCSS Preset Env][4] also runs a pass with [Autoprefixer][17], saving you
from writing vendor-specific prefixes. For release builds, all unused CSS
classes are automatically purged from the resulting code using [PurgeCSS][18].
[CSSO][19] is used as a final pass to minimize the code.

On release builds, the final HTML is run through [HTMLMinifier][20] prior to
compression with gzip.

### Preprocessor Directives
*imu* provides a set of directives available for use within files being
built. For HTML it is: `@import`, `@script` and`@svg`.

The `@import` directive must be enclosed in a comment tag. This will copy the
contents of the file into its place place.

As mentioned prior, `@import` will all search for paths relative to the
importing file. It will also search the subdirectories of `client` and
`client/pages`.

A `@script` directive has also been included, which behaves the same as
`@import` but will wrap the results in `<script type="x/templates">` tags. An
ID based upon the filename is included in these tags. As such, filenames must
consist only of valid ID characters and should not contain spaces.

In [Vue.js][24] HTML templates, only the `@import` directive is available.

```HTML
<div>
  <!-- @import "./local/project/file.html" //-->
</div>
```

```HTML
<div>
  <!-- @import "main/components/example" //-->
</div>
```

```HTML
<div>
  <!-- @import "share/example" //-->
</div>
```

##### SVG
An `@svg` directive has also been provided. It is used just like `@import` and
`@script`.

SVG files imported will first be parsed and processed to add an ID based upon
the filename, sans extension. The same restrictions on naming that apply to
`@script` also apply here.

Furthermore, the `fill` attribute is set to 'inherit' and any `height` or
`width` attribute is removed prior to inlining.

##### Vue
A `@vue` directive has been provided for use inside JavaScript components.
It will compile and inline the specified HTML template as a set of `render`
and `staticRenderFns` variables that can then be passed to the Vue object.

The search path behavior is identical to `@import` discussed above. It
also will resolve and inline any `@import` directive encountered.

```HTML
<section>
    <!-- @import "main/components/something" //-->
    <p>Example!</p>
</section>
```

```JavaScript
import Vue from "vue/dist/vue.runtime.esm";

// @vue "main/components/example"

var App = Vue.component("Example", {render, staticRenderFns});

export default App;
```

The import paths

## Server Overview
Optional [.NET Core 3.0][7] and [MySQL][8] support is provided as follows:

    * `imu server` builds the server project natively & SQL schema.
    * `imu server-linux` builds the server project specifically for Linux.
    * `imu sql` builds the SQL schema.

Copying configuration files, including [nginx][5] is done by:

    * `imu copy-conf` Copies all server-related configuration into 'deploy/'.

Furthermore, `new` has the following additional commands:

    * `imu new --server ServerName` starts a new server codebase.
    * `imu new --table Name` starts a new SQL table file.
    * `imu new --patch` starts a new SQL migration patch file.

Neither [.NET Core 3.0][7] or [MySQL][8] build support makes use of [tup][0].

### SQL Preprocessor
An equivalent of `@import` has been added for [MySQL][8] and is used much the same.

```MySQL
# @import "./local/table/name"
```

This is processed via the `imu sql` command.

## Resetting
Should any issues with build artifacts arise, you may always try `imu reset`.

This will remove all build artifacts from the project. As your project expands,
you may wish to update the list of files `reset` will remove in `./.imu/reset.js`.

## License
> Dual-Licensed. Pick one. Pick both. Pick carefully.

*imu* is available as [Jollo LNT or CC0 | Public Domain][23], as you
desire. Either way, you may make full use of the included files for any
reason, without attribution should you wish to leave no trace.

As *imu* aggressively strips code, including the original copyright comments,
the relevant copyright notices are added as a document comment to all pages
built for release. Be sure to keep `license.html` up to date as you change
libraries.

[0]: http://gittup.org/tup/
[1]: https://github.com/Freak613/stage0
[2]: https://github.com/adamhaile/S
[3]: https://tailwindcss.com/
[4]: https://preset-env.cssdb.org/
[5]: https://nginx.org/
[6]: https://nodejs.org/
[7]: https://www.microsoft.com/net/download/dotnet-core/3.0
[8]: https://www.mysql.com/
[9]: https://github.com/csstools/normalize.css/
[10]: http://postcss.org/
[11]: https://suitcss.github.io/
[12]: https://meyerweb.com/eric/tools/css/reset/
[13]: https://rollupjs.org/
[14]: https://github.com/fabiosantoscode/terser
[15]: https://github.com/postcss/postcss-import
[17]: https://github.com/postcss/autoprefixer
[18]: https://www.purgecss.com/
[19]: https://github.com/css/csso
[20]: https://github.com/kangax/html-minifier
[23]: https://github.com/AequoreaVictoria/imu/blob/master/LICENSE
[24]: https://vuejs.org
