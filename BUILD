- Install all dependencies of Uncrustify (cmake) and emscripten.

On Arch the community/emscripten package ships with everything provided out of
the box.
Ubuntu uses a too old version (emscripten >= 1.37.X is needed), We recommend to
use the emsdk to get the latest one
(see: https://kripken.github.io/emscripten-site/docs/tools_reference/emsdk.html)

Make sure to check that the 'LLVM' variable in '~/.emscripten' points to the
clang directory of the emsdk (.../emsdk-portable/clang) and not to the default
system binary path.

- Set the 'EMSCRIPTEN' environment variable to the emscripten root dir. This
directory should include em++, emcc, a cmake directory and so on.
( ARCH: /usr/lib/emscripten
 emsdk: .../emsdk-portable/emscripten/<version>/
)

- Either initialize and load the Uncrustify git submodule or soft link the
Uncrustify repository directory to uncrustify_config/uncrustify/

- Run 'npm install', that will trigger automatically the emscripten build,
will install all needed npm packages and build the webtool
(see the script section in the package.json file for the build commands)

- Open up the index.html file with your web browser after a successful build