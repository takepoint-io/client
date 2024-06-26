const serverListEndpoint = globalAPIBase + "/find_instances";
const devSettings = {
    logASMCalls: false
};

var Module = typeof Module != "undefined" ? Module : {};
if (typeof Object.assign == "undefined") {
    Object.assign = function (target, source) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            if (!source) {
                continue;
            }
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
}
window.getHashCode = function (input) {
    var hash = 0, i, chr;
    if (input.length === 0) {
        return hash;
    }
    for (i = 0; i < input.length; i++) {
        chr = input.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return hash;
};
window._e6c5a = function (string) {
    if (!string || string.length <= 0) {
        return;
    }
    var arr = [];
    for (var i = 0; i < string.length; ++i) {
        arr[i] = string.charCodeAt(i);
    }
    return allocateUTF8(String.fromCharCode.apply(null, arr));
};
var moduleOverrides = Object.assign({}, Module);
var arguments_ = [];
var thisProgram = "./this.program";
var quit_ = function (status, toThrow) {
    throw toThrow;
};
var ENVIRONMENT_IS_WEB = typeof window == "object";
var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (Module["ENVIRONMENT"]) {
    throw new Error("Module.ENVIRONMENT has been deprecated. To force the environment, use the ENVIRONMENT compile-time option (for example, -sENVIRONMENT=web or -sENVIRONMENT=node)");
}
var scriptDirectory = "";
function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory);
    }
    return scriptDirectory + path;
}
var read_, readAsync, readBinary, setWindowTitle;
function logExceptionOnExit(e) {
    if (e instanceof ExitStatus) {
        return;
    }
    var toLog = e;
    if (e && typeof e == "object" && e.stack) {
        toLog = [e, e.stack];
    }
    err("exiting due to exception: " + toLog);
}
var fs;
var nodePath;
var requireNodeFS;
if (ENVIRONMENT_IS_NODE) {
    if (!(typeof process == "object" && typeof require == "function")) {
        throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
    }
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = require("path").dirname(scriptDirectory) + "/";
    } else {
        scriptDirectory = __dirname + "/";
    }
    requireNodeFS = function () {
        if (!nodePath) {
            fs = require("fs");
            nodePath = require("path");
        }
    };
    read_ = function shell_read(filename, binary) {
        requireNodeFS();
        filename = nodePath["normalize"](filename);
        return fs.readFileSync(filename, binary ? undefined : "utf8");
    };
    readBinary = function (filename) {
        var ret = read_(filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret);
        }
        assert(ret.buffer);
        return ret;
    };
    readAsync = function (filename, onload, onerror) {
        requireNodeFS();
        filename = nodePath["normalize"](filename);
        fs.readFile(filename, function (err, data) {
            if (err) {
                onerror(err);
            } else {
                onload(data.buffer);
            }
        });
    };
    if (process["argv"].length > 1) {
        thisProgram = process["argv"][1].replace(/\\/g, "/");
    }
    arguments_ = process["argv"].slice(2);
    if (typeof module != "undefined") {
        module["exports"] = Module;
    }
    process["on"]("uncaughtException", function (ex) {
        if (!(ex instanceof ExitStatus)) {
            throw ex;
        }
    });
    process["on"]("unhandledRejection", function (reason) {
        throw reason;
    });
    quit_ = function (status, toThrow) {
        if (keepRuntimeAlive()) {
            process["exitCode"] = status;
            throw toThrow;
        }
        logExceptionOnExit(toThrow);
        process["exit"](status);
    };
    Module["inspect"] = function () {
        return "[Emscripten Module object]";
    };
} else if (ENVIRONMENT_IS_SHELL) {
    if (typeof process == "object" && typeof require === "function" || typeof window == "object" || typeof importScripts == "function") {
        throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
    }
    if (typeof read != "undefined") {
        read_ = function shell_read(f) {
            return read(f);
        };
    }
    readBinary = function readBinary(f) {
        var data;
        if (typeof readbuffer == "function") {
            return new Uint8Array(readbuffer(f));
        }
        data = read(f, "binary");
        assert(typeof data == "object");
        return data;
    };
    readAsync = function readAsync(f, onload, onerror) {
        setTimeout(function () {
            return onload(readBinary(f));
        }, 0);
    };
    if (typeof scriptArgs != "undefined") {
        arguments_ = scriptArgs;
    } else if (typeof arguments != "undefined") {
        arguments_ = arguments;
    }
    if (typeof quit == "function") {
        quit_ = function (status, toThrow) {
            logExceptionOnExit(toThrow);
            quit(status);
        };
    }
    if (typeof print != "undefined") {
        if (typeof console == "undefined") {
            console = {};
        }
        console.log = print;
        console.warn = console.error = typeof printErr != "undefined" ? printErr : print;
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
    } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
    } else {
        scriptDirectory = "";
    }
    if (!(typeof window == "object" || typeof importScripts == "function")) {
        throw new Error("not compiled for this environment (did you build to HTML and try to run it not on the web, or set ENVIRONMENT to something - like node - and run it someplace else - like on the web?)");
    }
    {
        read_ = function (url) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.send(null);
            return xhr.responseText;
        };
        if (ENVIRONMENT_IS_WORKER) {
            readBinary = function (url) {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
            };
        }
        readAsync = function (url, onload, onerror) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = function () {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                    onload(xhr.response);
                    return;
                }
                onerror();
            };
            xhr.onerror = onerror;
            xhr.send(null);
        };
    }
    setWindowTitle = function (title) {
        return document.title = title;
    };
} else {
    throw new Error("environment detection error");
}
var out = Module["print"] || console.log.bind(console);
var err = Module["printErr"] || console.warn.bind(console);
Object.assign(Module, moduleOverrides);
moduleOverrides = null;
checkIncomingModuleAPI();
if (Module["arguments"]) {
    arguments_ = Module["arguments"];
}
legacyModuleProp("arguments", "arguments_");
if (Module["thisProgram"]) {
    thisProgram = Module["thisProgram"];
}
legacyModuleProp("thisProgram", "thisProgram");
if (Module["quit"]) {
    quit_ = Module["quit"];
}
legacyModuleProp("quit", "quit_");
assert(typeof Module["memoryInitializerPrefixURL"] == "undefined", "Module.memoryInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["pthreadMainPrefixURL"] == "undefined", "Module.pthreadMainPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["cdInitializerPrefixURL"] == "undefined", "Module.cdInitializerPrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["filePackagePrefixURL"] == "undefined", "Module.filePackagePrefixURL option was removed, use Module.locateFile instead");
assert(typeof Module["read"] == "undefined", "Module.read option was removed (modify read_ in JS)");
assert(typeof Module["readAsync"] == "undefined", "Module.readAsync option was removed (modify readAsync in JS)");
assert(typeof Module["readBinary"] == "undefined", "Module.readBinary option was removed (modify readBinary in JS)");
assert(typeof Module["setWindowTitle"] == "undefined", "Module.setWindowTitle option was removed (modify setWindowTitle in JS)");
assert(typeof Module["TOTAL_MEMORY"] == "undefined", "Module.TOTAL_MEMORY has been renamed Module.INITIAL_MEMORY");
legacyModuleProp("read", "read_");
legacyModuleProp("readAsync", "readAsync");
legacyModuleProp("readBinary", "readBinary");
legacyModuleProp("setWindowTitle", "setWindowTitle");
var IDBFS = "IDBFS is no longer included by default; build with -lidbfs.js";
var PROXYFS = "PROXYFS is no longer included by default; build with -lproxyfs.js";
var WORKERFS = "WORKERFS is no longer included by default; build with -lworkerfs.js";
var NODEFS = "NODEFS is no longer included by default; build with -lnodefs.js";
assert(!ENVIRONMENT_IS_SHELL, "shell environment detected but not enabled at build time.  Add 'shell' to `-sENVIRONMENT` to enable.");
var STACK_ALIGN = 16;
var POINTER_SIZE = 4;
function getNativeTypeSize(type) {
    switch (type) {
        case "i1":
        case "i8":
        case "u8":
            return 1;
        case "i16":
        case "u16":
            return 2;
        case "i32":
        case "u32":
            return 4;
        case "i64":
        case "u64":
            return 8;
        case "float":
            return 4;
        case "double":
            return 8;
        default:
            {
                if (type[type.length - 1] === "*") {
                    return POINTER_SIZE;
                }
                if (type[0] === "i") {
                    var bits = Number(type.substr(1));
                    assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
                    return bits / 8;
                }
                return 0;
            }
    }
}
function legacyModuleProp(prop, newName) {
    if (!Object.getOwnPropertyDescriptor(Module, prop)) {
        Object.defineProperty(Module, prop, {
            configurable: true, get: function () {
                abort("Module." + prop + " has been replaced with plain " + newName + " (the initial value can be provided on Module, but after startup the value is only looked for on a local variable of that name)");
            }
        });
    }
}
function ignoredModuleProp(prop) {
    if (Object.getOwnPropertyDescriptor(Module, prop)) {
        abort("`Module." + prop + "` was supplied but `" + prop + "` not included in INCOMING_MODULE_JS_API");
    }
}
function isExportedByForceFilesystem(name) {
    return name === "FS_createPath" || name === "FS_createDataFile" || name === "FS_createPreloadedFile" || name === "FS_unlink" || name === "addRunDependency" || name === "FS_createLazyFile" || name === "FS_createDevice" || name === "removeRunDependency";
}
function missingLibrarySymbol(sym) {
    if (typeof globalThis !== "undefined" && !Object.getOwnPropertyDescriptor(globalThis, sym)) {
        Object.defineProperty(globalThis, sym, {
            configurable: true, get: function () {
                var msg = "`" + sym + "` is a library symbol and not included by default; add it to your library.js __deps or to DEFAULT_LIBRARY_FUNCS_TO_INCLUDE on the command line";
                if (isExportedByForceFilesystem(sym)) {
                    msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
                }
                warnOnce(msg);
                return undefined;
            }
        });
    }
}
function unexportedRuntimeSymbol(sym) {
    if (!Object.getOwnPropertyDescriptor(Module, sym)) {
        Object.defineProperty(Module, sym, {
            configurable: true, get: function () {
                var msg = "'" + sym + "' was not exported. add it to EXPORTED_RUNTIME_METHODS (see the FAQ)";
                if (isExportedByForceFilesystem(sym)) {
                    msg += ". Alternatively, forcing filesystem support (-sFORCE_FILESYSTEM) can export this for you";
                }
                abort(msg);
            }
        });
    }
}
var wasmBinary;
if (Module["wasmBinary"]) {
    wasmBinary = Module["wasmBinary"];
}
legacyModuleProp("wasmBinary", "wasmBinary");
var noExitRuntime = Module["noExitRuntime"] || true;
legacyModuleProp("noExitRuntime", "noExitRuntime");
if (typeof WebAssembly != "object") {
    abort("no native wasm support detected");
}
var wasmMemory;
var ABORT = false;
var EXITSTATUS;
function assert(condition, text) {
    if (!condition) {
        abort("Assertion failed" + (text ? ": " + text : ""));
    }
}
var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (heapOrArray[endPtr] && !(endPtr >= endIdx)) {
        ++endPtr;
    }
    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
    }
    var str = "";
    while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2;
        } else {
            if ((u0 & 248) != 240) {
                warnOnce("Invalid UTF-8 leading byte 0x" + u0.toString(16) + " encountered when deserializing a UTF-8 string in wasm memory to a JS string!");
            }
            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
        }
        if (u0 < 65536) {
            str += String.fromCharCode(u0);
        } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        }
    }
    return str;
}
function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}
function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
    if (!(maxBytesToWrite > 0)) {
        return 0;
    }
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023;
        }
        if (u <= 127) {
            if (outIdx >= endIdx) {
                break;
            }
            heap[outIdx++] = u;
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) {
                break;
            }
            heap[outIdx++] = 192 | u >> 6;
            heap[outIdx++] = 128 | u & 63;
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) {
                break;
            }
            heap[outIdx++] = 224 | u >> 12;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
        } else {
            if (outIdx + 3 >= endIdx) {
                break;
            }
            if (u > 1114111) {
                warnOnce("Invalid Unicode code point 0x" + u.toString(16) + " encountered when serializing a JS string to a UTF-8 string in wasm memory! (Valid unicode code points should be in range 0-0x10FFFF).");
            }
            heap[outIdx++] = 240 | u >> 18;
            heap[outIdx++] = 128 | u >> 12 & 63;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
        }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx;
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
    assert(typeof maxBytesToWrite == "number", "stringToUTF8(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}
function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c <= 127) {
            len++;
        } else if (c <= 2047) {
            len += 2;
        } else if (c >= 55296 && c <= 57343) {
            len += 4;
            ++i;
        } else {
            len += 3;
        }
    }
    return len;
}
var HEAP, buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferAndViews(buf) {
    buffer = buf;
    Module["HEAP8"] = HEAP8 = new Int8Array(buf);
    Module["HEAP16"] = HEAP16 = new Int16Array(buf);
    Module["HEAP32"] = HEAP32 = new Int32Array(buf);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(buf);
}
var TOTAL_STACK = 5242880;
if (Module["TOTAL_STACK"]) {
    assert(TOTAL_STACK === Module["TOTAL_STACK"], "the stack size can no longer be determined at runtime");
}
var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
legacyModuleProp("INITIAL_MEMORY", "INITIAL_MEMORY");
assert(INITIAL_MEMORY >= TOTAL_STACK, "INITIAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
assert(typeof Int32Array != "undefined" && typeof Float64Array !== "undefined" && Int32Array.prototype.subarray != undefined && Int32Array.prototype.set != undefined, "JS engine does not provide full typed array support");
assert(!Module["wasmMemory"], "Use of `wasmMemory` detected.  Use -sIMPORTED_MEMORY to define wasmMemory externally");
assert(INITIAL_MEMORY == 16777216, "Detected runtime INITIAL_MEMORY setting.  Use -sIMPORTED_MEMORY to define wasmMemory dynamically");
var wasmTable;
function writeStackCookie() {
    var max = _emscripten_stack_get_end();
    assert((max & 3) == 0);
    HEAP32[max >> 2] = 34821223;
    HEAP32[max + 4 >> 2] = 2310721022;
    HEAPU32[0] = 1668509029;
}
function checkStackCookie() {
    if (ABORT) {
        return;
    }
    var max = _emscripten_stack_get_end();
    var cookie1 = HEAPU32[max >> 2];
    var cookie2 = HEAPU32[max + 4 >> 2];
    if (cookie1 != 34821223 || cookie2 != 2310721022) {
        abort("Stack overflow! Stack cookie has been overwritten at 0x" + max.toString(16) + ", expected hex dwords 0x89BACDFE and 0x2135467, but received 0x" + cookie2.toString(16) + " 0x" + cookie1.toString(16));
    }
    if (HEAPU32[0] !== 1668509029) {
        abort("Runtime error: The application has corrupted its heap memory area (address zero)!");
    }
}
(function () {
    var h16 = new Int16Array(1);
    var h8 = new Int8Array(h16.buffer);
    h16[0] = 25459;
    if (h8[0] !== 115 || h8[1] !== 99) {
        throw "Runtime error: expected the system to be little-endian! (Run with -sSUPPORT_BIG_ENDIAN to bypass)";
    }
})();
var __ATPRERUN__ = [];
var __ATINIT__ = [];
var __ATMAIN__ = [];
var __ATEXIT__ = [];
var __ATPOSTRUN__ = [];
var runtimeInitialized = false;
function keepRuntimeAlive() {
    return noExitRuntime;
}
function preRun() {
    if (Module["preRun"]) {
        if (typeof Module["preRun"] == "function") {
            Module["preRun"] = [Module["preRun"]];
        }
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift());
        }
    }
    callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
    assert(!runtimeInitialized);
    runtimeInitialized = true;
    checkStackCookie();
    if (!Module["noFSInit"] && !FS.init.initialized) {
        FS.init();
    }
    FS.ignorePermissions = false;
    TTY.init();
    callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
    checkStackCookie();
    callRuntimeCallbacks(__ATMAIN__);
}
function postRun() {
    checkStackCookie();
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") {
            Module["postRun"] = [Module["postRun"]];
        }
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift());
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb);
}
function addOnInit(cb) {
    __ATINIT__.unshift(cb);
}
function addOnPreMain(cb) {
    __ATMAIN__.unshift(cb);
}
function addOnExit(cb) {
}
function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb);
}
if (!Math.imul || Math.imul(4294967295, 5) !== -5) {
    Math.imul = function imul(a, b) {
        var ah = a >>> 16;
        var al = a & 65535;
        var bh = b >>> 16;
        var bl = b & 65535;
        return al * bl + (ah * bl + al * bh << 16) | 0;
    };
}
if (!Math.fround) {
    var froundBuffer = new Float32Array(1);
    Math.fround = function (x) {
        froundBuffer[0] = x;
        return froundBuffer[0];
    };
}
if (!Math.clz32) {
    Math.clz32 = function (x) {
        var n = 32;
        var y = x >> 16;
        if (y) {
            n -= 16;
            x = y;
        }
        y = x >> 8;
        if (y) {
            n -= 8;
            x = y;
        }
        y = x >> 4;
        if (y) {
            n -= 4;
            x = y;
        }
        y = x >> 2;
        if (y) {
            n -= 2;
            x = y;
        }
        y = x >> 1;
        if (y) {
            return n - 2;
        }
        return n - x;
    };
}
if (!Math.trunc) {
    Math.trunc = function (x) {
        return x < 0 ? Math.ceil(x) : Math.floor(x);
    };
}
assert(Math.imul, "This browser does not support Math.imul(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.fround, "This browser does not support Math.fround(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.clz32, "This browser does not support Math.clz32(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
assert(Math.trunc, "This browser does not support Math.trunc(), build with LEGACY_VM_SUPPORT or POLYFILL_OLD_MATH_FUNCTIONS to add in a polyfill");
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
var runDependencyTracking = {};
function getUniqueRunDependency(id) {
    var orig = id;
    while (1) {
        if (!runDependencyTracking[id]) {
            return id;
        }
        id = orig + Math.random();
    }
}
function addRunDependency(id) {
    runDependencies++;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
    }
    if (id) {
        assert(!runDependencyTracking[id]);
        runDependencyTracking[id] = 1;
        if (runDependencyWatcher === null && typeof setInterval != "undefined") {
            runDependencyWatcher = setInterval(function () {
                if (ABORT) {
                    clearInterval(runDependencyWatcher);
                    runDependencyWatcher = null;
                    return;
                }
                var shown = false;
                for (var dep in runDependencyTracking) {
                    if (!shown) {
                        shown = true;
                        err("still waiting on run dependencies:");
                    }
                    err("dependency: " + dep);
                }
                if (shown) {
                    err("(end of list)");
                }
            }, 10000);
        }
    } else {
        err("warning: run dependency added without ID");
    }
}
function removeRunDependency(id) {
    runDependencies--;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies);
    }
    if (id) {
        assert(runDependencyTracking[id]);
        delete runDependencyTracking[id];
    } else {
        err("warning: run dependency removed without ID");
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null;
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
        }
    }
}
function abort(what) {
    {
        if (Module["onAbort"]) {
            Module["onAbort"](what);
        }
    }
    what = "Aborted(" + what + ")";
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    var e = new WebAssembly.RuntimeError(what);
    throw e;
}
var dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(filename) {
    return filename.startsWith(dataURIPrefix);
}
function isFileURI(filename) {
    return filename.startsWith("file://");
}
function createExportWrapper(name, fixedasm) {
    return function () {
        var displayName = name;
        var asm = fixedasm;
        if (!fixedasm) {
            asm = Module["asm"];
        }
        assert(runtimeInitialized, "native function `" + displayName + "` called before runtime initialization");
        if (!asm[name]) {
            assert(asm[name], "exported native function `" + displayName + "` not found");
        }
        return asm[name].apply(null, arguments);
    };
}
var wasmBinaryFile;
wasmBinaryFile = "client-1.13.6.7.wasm.wasm";
if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
}
function getBinary(file) {
    try {
        if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
            return readBinary(file);
        }
        throw "both async and sync fetching of the wasm failed";
    } catch (err$0) {
        abort(err$0);
    }
}
function getBinaryPromise() {
    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
        if (typeof fetch == "function" && !isFileURI(wasmBinaryFile)) {
            return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function (response) {
                if (!response["ok"]) {
                    throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
                }
                return response["arrayBuffer"]();
            }).catch(function () {
                return getBinary(wasmBinaryFile);
            });
        } else {
            if (readAsync) {
                return new Promise(function (resolve, reject) {
                    readAsync(wasmBinaryFile, function (response) {
                        resolve(new Uint8Array(response));
                    }, reject);
                });
            }
        }
    }
    return Promise.resolve().then(function () {
        return getBinary(wasmBinaryFile);
    });
}
function createWasm() {
    var info = { "env": asmLibraryArg, "wasi_snapshot_preview1": asmLibraryArg, };
    function receiveInstance(instance, module) {
        var exports = instance.exports;
        Module["asm"] = exports;
        wasmMemory = Module["asm"]["memory"];
        assert(wasmMemory, "memory not found in wasm exports");
        updateGlobalBufferAndViews(wasmMemory.buffer);
        wasmTable = Module["asm"]["__indirect_function_table"];
        assert(wasmTable, "table not found in wasm exports");
        addOnInit(Module["asm"]["__wasm_call_ctors"]);
        removeRunDependency("wasm-instantiate");
    }
    addRunDependency("wasm-instantiate");
    var trueModule = Module;
    function receiveInstantiationResult(result) {
        assert(Module === trueModule, "the Module object should not be replaced during async compilation - perhaps the order of HTML elements is wrong?");
        trueModule = null;
        receiveInstance(result["instance"]);
    }
    function instantiateArrayBuffer(receiver) {
        return getBinaryPromise().then(function (binary) {
            return WebAssembly.instantiate(binary, info);
        }).then(function (instance) {
            return instance;
        }).then(receiver, function (reason) {
            err("failed to asynchronously prepare wasm: " + reason);
            if (isFileURI(wasmBinaryFile)) {
                err("warning: Loading from a file URI (" + wasmBinaryFile + ") is not supported in most browsers. See https://emscripten.org/docs/getting_started/FAQ.html#how-do-i-run-a-local-webserver-for-testing-why-does-my-program-stall-in-downloading-or-preparing");
            }
            abort(reason);
        });
    }
    function instantiateAsync() {
        if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
            return fetch(wasmBinaryFile, { credentials: "same-origin" }).then(function (response) {
                var result = WebAssembly.instantiateStreaming(response, info);
                return result.then(receiveInstantiationResult, function (reason) {
                    err("wasm streaming compile failed: " + reason);
                    err("falling back to ArrayBuffer instantiation");
                    return instantiateArrayBuffer(receiveInstantiationResult);
                });
            });
        } else {
            return instantiateArrayBuffer(receiveInstantiationResult);
        }
    }
    if (Module["instantiateWasm"]) {
        try {
            var exports = Module["instantiateWasm"](info, receiveInstance);
            return exports;
        } catch (e) {
            err("Module.instantiateWasm callback failed with error: " + e);
            return false;
        }
    }
    instantiateAsync();
    return {};
}
var tempDouble;
var tempI64;
var ASM_CONSTS = {
    131908: function () {
        loginViaCookie();
    }, 131926: function () {
        closeLogin();
        closeRegister();
    }, 131956: function () {
        document.getElementById("authLabel").style.color = "#64ff5a";
    }, 132022: function () {
        document.getElementById("authLabel").style.color = "#fff";
    }, 132085: function ($0, $1, $2) {
        document.getElementById(UTF8ToString($1)).style.display = "block";
        document.getElementById(UTF8ToString($1)).innerHTML = UTF8ToString($2);
        document.getElementById(UTF8ToString($0)).classList.add("error");
    }, 132294: function ($0, $1) {
        document.getElementById(UTF8ToString($1)).style.display = "none";
        document.getElementById(UTF8ToString($0)).classList.remove("error");
    }, 132433: function () {
        sm();
    }, 132443: function () {
        var ctx = document.getElementById("canvas").getContext("2d");
        contexts[0] = ctx;
        var hud = document.getElementById("hud").getContext("2d");
        contexts[1] = hud;
        Module.setCanvasSize("canvas");
        window.onresize = function () {
            Module.setBrowserSize(0);
        };
    }, 132692: function ($0, $1, $2) {
        contexts[$0].clearRect(0, 0, $1, $2);
    }, 132734: function ($0, $1, $2) {
        contexts[$0].fillRect(0, 0, $1, $2);
    }, 132775: function ($0, $1, $2) {
        contexts[$0].scale($1, $2);
    }, 132807: function ($0, $1, $2, $3, $4, $5, $6) {
        contexts[$0].setTransform($1, $2, $3, $4, $5, $6);
    }, 132862: function () {
        return window.innerWidth;
    }, 132892: function () {
        return window.innerHeight;
    }, 132923: function ($0, $1, $2, $3) {
        renderArea.canvasWidth = $2;
        renderArea.canvasHeight = $3;
    }, 132986: function () {
        return window.devicePixelRatio;
    }, 133022: function ($0) {
        var canvas = document.getElementById(UTF8ToString($0));
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = canvas.width / window.devicePixelRatio + "px";
        canvas.style.height = canvas.height / window.devicePixelRatio + "px";
    }, 133342: function () {
        //refresh ads
    }, 133643: function () {
        return 0;
    }, 133706: function () {
        document.onkeydown = function (event) {
            if (event.keyCode) {
                Module.onkeydown(event.keyCode);
            }
            if (event.keyCode == 32 && event.target.id != "chatbox") {
                event.preventDefault();
            }
            if (event.keyCode == 114) {
                Module.toggleDebug();
            }
        };
        document.onkeyup = function (event) {
            if (event.keyCode) {
                if (event.keyCode == 32) {
                    for(var i = 0; i < Object.keys(sockets).length; i++) {
                        if (sockets[i].readyState == 1) sockets[i].send(new TextEncoder().encode("k,5,0\x00"));
                    }
                    return;
                }
                Module.onkeyup(event.keyCode);
            }
            if (event.keyCode == 32 && event.target.id != "chatbox") {
                event.preventDefault();
            }
        };
        document.onmousemove = function (event) {
            if (window.disconnected && !window.reconnecting && window.serverName) {
                window.reconnecting = true;
                setTimeout(() => {
                    Module.switchServers(window.serverName);
                }, 500);
            }
            Module.onmousemove(event.clientX, event.clientY);
        };
        document.onmousedown = function (event) {
            Module.onmousedown(event.clientX, event.clientY, event.which);
        };
        document.onmouseup = function (event) {
            Module.onmouseup(event.clientX, event.clientY, event.which);
        };
        document.onwheel = function (event) {
            Module.onwheel(event.deltaY);
            event.preventDefault();
        };
        window.onblur = function () {
            Module.focus(0);
        };
        window.onfocus = function () {
            Module.focus(1);
        };
    }, 134549: function () {
        if (loginOpen) {
            login();
        } else if (registerOpen) {
            register();
        }
    }, 134612: function () {
        eg();
    }, 134622: function ($0, $1, $2, $3) {
        contexts[$0].fillStyle = "rgb(" + $1 + ", " + $2 + ", " + $3 + ")";
    }, 134694: function ($0, $1, $2, $3) {
        contexts[$0].strokeStyle = "rgb(" + $1 + ", " + $2 + ", " + $3 + ")";
    }, 134768: function ($0, $1) {
        contexts[$0].globalAlpha = $1;
    }, 134803: function ($0, $1) {
        contexts[$0].lineWidth = $1;
    }, 134836: function () {
        document.getElementById("canvas").style.cursor = "pointer";
        document.getElementById("hud").style.cursor = "pointer";
        document.getElementById("chatboxContainer").style.cursor = "pointer";
    }, 135027: function () {
        document.getElementById("canvas").style.cursor = "default";
        document.getElementById("hud").style.cursor = "default";
        document.getElementById("chatboxContainer").style.cursor = "default";
    }, 135218: function ($0, $1, $2, $3, $4) {
        contexts[$0].strokeRect($1, $2, $3, $4);
    }, 135263: function ($0, $1, $2, $3, $4) {
        contexts[$0].fillRect($1, $2, $3, $4);
    }, 135306: function ($0) {
        contexts[$0].beginPath();
    }, 135336: function ($0, $1, $2, $3, $4, $5) {
        contexts[$0].arc($1, $2, $3, $4, $5);
    }, 135378: function ($0, $1, $2, $3, $4, $5) {
        contexts[$0].arcTo($1, $2, $3, $4, $5);
    }, 135422: function ($0) {
        contexts[$0].stroke();
    }, 135449: function ($0) {
        contexts[$0].fill();
    }, 135474: function ($0, $1, $2) {
        contexts[$0].moveTo($1, $2);
    }, 135507: function ($0, $1, $2) {
        contexts[$0].lineTo($1, $2);
    }, 135540: function ($0) {
        contexts[$0].closePath();
    }, 135570: function ($0, $1) {
        contexts[$0].textAlign = UTF8ToString($1);
    }, 135617: function ($0, $1) {
        contexts[$0].textBaseline = UTF8ToString($1);
    }, 135667: function ($0, $1) {
        contexts[$0].font = $1 + "px 'Orbitron', sans-serif";
    }, 135725: function ($0, $1) {
        contexts[$0].miterLimit = $1;
    }, 135759: function ($0, $1) {
        switch ($1) {
            case 0:
                contexts[$0].lineJoin = "bevel";
                break;
            case 1:
                contexts[$0].lineJoin = "round";
                break;
            case 2:
                contexts[$0].lineJoin = "miter";
                break;
        }
    }, 135921: function ($0) {
        contexts[$0].save();
    }, 135946: function ($0) {
        contexts[$0].restore();
    }, 135974: function ($0, $1) {
        contexts[$0].rotate($1);
    }, 136003: function ($0, $1, $2, $3) {
        contexts[$0].strokeText(UTF8ToString($1), $2, $3);
    }, 136058: function ($0, $1, $2, $3) {
        contexts[$0].fillText(UTF8ToString($1), $2, $3);
    }, 136111: function ($0, $1) {
        return contexts[$0].measureText(UTF8ToString($1)).width;
    }, 136172: function ($0) {
        let elemName = UTF8ToString($0);
        if (elemName == "hiscores") elemName = "highscores";
        var element = document.getElementById(elemName);
        if (!element) {
            return;
        }
        element.style.display = "none";
    }, 136286: function ($0) {
        var element = document.getElementById(UTF8ToString($0));
        if (!element) {
            return;
        }
        if (UTF8ToString($0) == "chatbox" && (navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1)) {
            element.style.display = "flex";
        } else {
            element.style.display = "flex";
        }
    }, 136572: function ($0) {
        document.getElementById(UTF8ToString($0)).focus();
    }, 136627: function ($0) {
        document.getElementById(UTF8ToString($0)).value = "";
    }, 136685: function () {
        if (typeof aipAPItag !== "undefined") {
            aipAPItag.hideCMPButton();
        }
    }, 136757: function () {
        if (typeof aipAPItag !== "undefined") {
            aipAPItag.showCMPButton();
        }
    }, 136829: function () {
        contexts = [];
        renderArea = {};
        sockets = {};
    }, 136875: function () {
        document.getElementById("enterGameContainer").style.display = "flex";
        document.getElementById("highscores").style.display = "block"
    }, 136994: function ($0) {
        var connection = new WebSocket(sockets[$0].connectIp);
        connection.binaryType = "arraybuffer";
        connection.events = [];
        connection.socketId = $0;
        sockets[$0] = connection;
        connection.onmessage = function (e) {
            var uint8Array = new Uint8Array(e.data);
            var buffer = Module._malloc(uint8Array.length);
            writeArrayToMemory(uint8Array, buffer);
            connection.events.push([buffer, uint8Array.length, Module.getClientTime()]);
        };
        connection.onopen = function() {
            window.disconnected = false;
            window.reconnecting = false;
            window.hookWS(connection);
        }
        connection.onclose = function (e) {
            window.serverName = document.getElementById("serverSelector").value;
            window.disconnected = true;
        };
    }, 137413: function ($0) {
        var serverSelector = document.getElementById("serverSelector");
        if (serverSelector) {
            serverSelector.value = UTF8ToString($0);
        }
    }, 137544: function ($0) {
        var socket = sockets[$0];
        if (socket.events === undefined) {
            return;
        }
        for (var i = 0; i < socket.events.length; ++i) {
            var ptr = socket.events[i][0];
            var message = HEAP8.subarray(ptr, ptr + socket.events[i][1]);
            var uint8Array = new Uint8Array(message);
            Module.receive(uint8Array, $0, socket.events[i][2]);
        }
        socket.events = [];
    }, 137874: function ($0) {
        sockets[$0].ping = Date.now() - sockets[$0].sentTime;
        if (sockets[$0].numTests) {
            ++sockets[$0].numTests;
        } else {
            sockets[$0].numTests = 1;
        }
        if (sockets[$0].numTests < 5) {
            console.log("Pinging " + sockets[$0].serverName + " ..." + sockets[$0].numTests);
            Module.ping(sockets[$0].socketId);
        } else {
            console.log("5 successful pings on " + sockets[$0].serverName);
            Module.closeConnections();
            Module.finalize($0, sockets[$0].serverName, sockets[$0].ip);
        }
    }, 138327: function ($0, $1, $2, $3, $4) {
        try {
            var socket = new WebSocket(UTF8ToString($1));
            socket.binaryType = "arraybuffer";
            socket.ip = UTF8ToString($2);
            socket.serverName = UTF8ToString($3);
            socket.connectIp = UTF8ToString($0);
            socket.socketId = $4;
            sockets[$4] = socket;
            console.log("Build test connection for: " + socket.ip);
        } catch (e) {
            return;
        }
        socket.onmessage = function (e) {
            var uint8Array = new Uint8Array(e.data);
            if (uint8Array[0] == 46) {
                Module.testResponse(socket.socketId);
            }
        };
    }, 138784: function ($0) {
        return sockets[$0].readyState;
    }, 138819: function () {
        Module.setHostname("takepoint.io");
    }, 138862: function () {
        try {
            var query = window.location.search;
            var params = new URLSearchParams(query);
            var value = params.get("server");
            if (value) {
                return _e6c5a(value);
            }
            return -1;
        } catch (e) {
            console.log(e);
            return -1;
        }
    }, 139069: function ($0) {
        _free($0);
    }, 139084: function ($0) {
        window.location = window.location.origin + "?server=" + UTF8ToString($0);
    }, 139162: function ($0, $1) {
        if (!sockets[$0].initialPingSent) {
            console.log("Sending initial ping to " + UTF8ToString($1));
            Module.ping($0);
            sockets[$0].initialPingSent = 1;
        }
    }, 139312: function () {
        for (var i in sockets) {
            sockets[i].close();
            console.log("Closed connection " + sockets[i].serverName);
        }
    }, 139420: function ($0, $1, $2) {
        var socket = sockets[$0];
        if (!socket) {
            return;
        }
        if (socket.readyState != 1) {
            return;
        } else {
            var str = UTF8ToString($1);
            var ptr = Module._malloc($2);
            Module.stringToUTF8(str, ptr, $2 * 4);
            try {
                sockets[$0].send(HEAP8.subarray(ptr, ptr + $2));
                Module._free(ptr);
            } catch (e) {
                return;
            }
        }
    }, 139711: function ($0) {
        grecaptcha.ready(function () {
            grecaptcha.execute("6LcsTAEqAAAAAB3NYunGHbpXrZkKIgbj6oWuaqBy", { action: "connect" }).then(function (token) {
                var msg = "v," + token;
                var ptr = Module._malloc(msg.length);
                Module.stringToUTF8(msg, ptr, msg.length * 4);
                sockets[$0].send(HEAP8.subarray(ptr, ptr + msg.length));
                Module._free(ptr);
            });
        });
    }, 140045: function ($0, $1) {
        var msg = "t," + UTF8ToString($1);
        var ptr = Module._malloc(msg.length);
        Module.stringToUTF8(msg, ptr, msg.length * 4);
        sockets[$0].send(HEAP8.subarray(ptr, ptr + msg.length));
        Module._free(ptr);
    }, 140245: function ($0) {
        var content;
        try {
            content = JSON.parse(UTF8ToString($0));
        } catch (error) {
            console.error(error);
        }
        var selector = document.getElementById("serverSelector");
        selector.innerHTML = "";
        for (i in content) {
            var n = document.createElement("option");
            n.value = content[i].city;
            n.innerHTML = `${content[i].region} - ${content[i].city} [${content[i].players}/${content[i].capacity}]`;
            selector.appendChild(n);
        }
    }, 140640: function () {
        return Date.now();
    }, 140663: function ($0, $1) {
        var element = document.getElementById(UTF8ToString($0));
        if (element == null) {
            return;
        }
        element.innerHTML = UTF8ToString($1);
    }, 140793: function ($0, $1, $2) {
        var d = new Date();
        d.setTime(Date.now() + $2 * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = UTF8ToString($0) + "=" + UTF8ToString($1) + ";" + expires + ";path=/";
    }, 141E3: function () {
        try {
            Module.recordHardware(navigator.deviceMemory, navigator.hardwareConcurrency, navigator.connection.downlink, navigator.platform, navigator.userAgent);
        } catch (e) {
            console.log(e);
        }
    }
};
var asmCommonTable = {  
    134622: function(args) {
        console.log("set fillstyle " + "rgb(" + args[1] + ", " + args[2] + ", " + args[3] + ")");
    },
    135306: function(args) {

    },
    135422: function(args) {
        
    },
    135474: function(args) {
        //console.log(`Move to ${args[1]}, ${args[2]}`);
    },
    135507: function(args) {
        //console.log(`Line to ${args[1]}, ${args[2]}`);
    },
    135336: function (args) {
        console.log(`Draw arc x:${args[1]} y:${args[2]} radius:${args[3]} start:${args[4]} end:${args[5]}`);
    },
    135725: function (args) {
        //console.log(`Set miterlimit to ${args[0]}`);
    },
    136172: function (args) {
        console.log(`Hide element: ${UTF8ToString(args[0])}`);
    },
    136286: function (args) {
        console.log(`Set display to flex for: ${UTF8ToString(args[0])}`);
    },
    138819: function() {
        console.log(`Set hostname to takepoint.io`);
    },
    138862: function() {
        console.log("Get server if exists in URL");
    },
    139069: function(args) {
        console.log(`Free ptr ${args[0]}, text: ${UTF8ToString(args[0])}`)
    },
    140640: function(args) {
        console.log("Get Date.now()");
    }
};
function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = "Program terminated with exit(" + status + ")";
    this.status = status;
}
function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        callbacks.shift()(Module);
    }
}
function withStackSave(f) {
    var stack = stackSave();
    var ret = f();
    stackRestore(stack);
    return ret;
}
function demangle(func) {
    warnOnce("warning: build with -sDEMANGLE_SUPPORT to link in libcxxabi demangling");
    return func;
}
function demangleAll(text) {
    var regex = /\b_Z[\w\d_]+/g;
    return text.replace(regex, function (x) {
        var y = demangle(x);
        return x === y ? x : y + " [" + x + "]";
    });
}
function getValue(ptr, type) {
    type = type === void 0 ? "i8" : type;
    if (type.endsWith("*")) {
        type = "*";
    }
    switch (type) {
        case "i1":
            return HEAP8[ptr >> 0];
        case "i8":
            return HEAP8[ptr >> 0];
        case "i16":
            return HEAP16[ptr >> 1];
        case "i32":
            return HEAP32[ptr >> 2];
        case "i64":
            return HEAP32[ptr >> 2];
        case "float":
            return HEAPF32[ptr >> 2];
        case "double":
            return HEAPF64[ptr >> 3];
        case "*":
            return HEAPU32[ptr >> 2];
        default:
            abort("invalid type for getValue: " + type);
    }
    return null;
}
function handleException(e) {
    if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS;
    }
    quit_(1, e);
}
function jsStackTrace() {
    var error = new Error();
    if (!error.stack) {
        try {
            throw new Error();
        } catch (e) {
            error = e;
        }
        if (!error.stack) {
            return "(no stack trace available)";
        }
    }
    return error.stack.toString();
}
function setValue(ptr, value, type) {
    type = type === void 0 ? "i8" : type;
    if (type.endsWith("*")) {
        type = "*";
    }
    switch (type) {
        case "i1":
            HEAP8[ptr >> 0] = value;
            break;
        case "i8":
            HEAP8[ptr >> 0] = value;
            break;
        case "i16":
            HEAP16[ptr >> 1] = value;
            break;
        case "i32":
            HEAP32[ptr >> 2] = value;
            break;
        case "i64":
            tempI64 = [value >>> 0, (tempDouble = value, +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
            break;
        case "float":
            HEAPF32[ptr >> 2] = value;
            break;
        case "double":
            HEAPF64[ptr >> 3] = value;
            break;
        case "*":
            HEAPU32[ptr >> 2] = value;
            break;
        default:
            abort("invalid type for setValue: " + type);
    }
}
function stackTrace() {
    var js = jsStackTrace();
    if (Module["extraStackTrace"]) {
        js += "\n" + Module["extraStackTrace"]();
    }
    return demangleAll(js);
}
function warnOnce(text) {
    if (!warnOnce.shown) {
        warnOnce.shown = {};
    }
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        if (ENVIRONMENT_IS_NODE) {
            text = "warning: " + text;
        }
        err(text);
    }
}
function writeArrayToMemory(array, buffer) {
    assert(array.length >= 0, "writeArrayToMemory array must have a length (should be an array or typed array)");
    HEAP8.set(array, buffer);
}
function ___assert_fail(condition, filename, line, func) {
    abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
}
function ___cxa_allocate_exception(size) {
    return _malloc(size + 24) + 24;
}
function ExceptionInfo(excPtr) {
    this.excPtr = excPtr;
    this.ptr = excPtr - 24;
    this.set_type = function (type) {
        HEAPU32[this.ptr + 4 >> 2] = type;
    };
    this.get_type = function () {
        return HEAPU32[this.ptr + 4 >> 2];
    };
    this.set_destructor = function (destructor) {
        HEAPU32[this.ptr + 8 >> 2] = destructor;
    };
    this.get_destructor = function () {
        return HEAPU32[this.ptr + 8 >> 2];
    };
    this.set_refcount = function (refcount) {
        HEAP32[this.ptr >> 2] = refcount;
    };
    this.set_caught = function (caught) {
        caught = caught ? 1 : 0;
        HEAP8[this.ptr + 12 >> 0] = caught;
    };
    this.get_caught = function () {
        return HEAP8[this.ptr + 12 >> 0] != 0;
    };
    this.set_rethrown = function (rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[this.ptr + 13 >> 0] = rethrown;
    };
    this.get_rethrown = function () {
        return HEAP8[this.ptr + 13 >> 0] != 0;
    };
    this.init = function (type, destructor) {
        this.set_adjusted_ptr(0);
        this.set_type(type);
        this.set_destructor(destructor);
        this.set_refcount(0);
        this.set_caught(false);
        this.set_rethrown(false);
    };
    this.add_ref = function () {
        var value = HEAP32[this.ptr >> 2];
        HEAP32[this.ptr >> 2] = value + 1;
    };
    this.release_ref = function () {
        var prev = HEAP32[this.ptr >> 2];
        HEAP32[this.ptr >> 2] = prev - 1;
        assert(prev > 0);
        return prev === 1;
    };
    this.set_adjusted_ptr = function (adjustedPtr) {
        HEAPU32[this.ptr + 16 >> 2] = adjustedPtr;
    };
    this.get_adjusted_ptr = function () {
        return HEAPU32[this.ptr + 16 >> 2];
    };
    this.get_exception_ptr = function () {
        var isPointer = ___cxa_is_pointer_type(this.get_type());
        if (isPointer) {
            return HEAPU32[this.excPtr >> 2];
        }
        var adjusted = this.get_adjusted_ptr();
        if (adjusted !== 0) {
            return adjusted;
        }
        return this.excPtr;
    };
}
var exceptionLast = 0;
var uncaughtExceptionCount = 0;
function ___cxa_throw(ptr, type, destructor) {
    var info = new ExceptionInfo(ptr);
    info.init(type, destructor);
    exceptionLast = ptr;
    uncaughtExceptionCount++;
    throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -sNO_DISABLE_EXCEPTION_CATCHING or -sEXCEPTION_CATCHING_ALLOWED=[..] to catch.";
}
function setErrNo(value) {
    HEAP32[___errno_location() >> 2] = value;
    return value;
}
var PATH = {
    isAbs: function (path) {
        return path.charAt(0) === "/";
    }, splitPath: function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
    }, normalizeArray: function (parts, allowAboveRoot) {
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
            var last = parts[i];
            if (last === ".") {
                parts.splice(i, 1);
            } else if (last === "..") {
                parts.splice(i, 1);
                up++;
            } else if (up) {
                parts.splice(i, 1);
                up--;
            }
        }
        if (allowAboveRoot) {
            for (; up; up--) {
                parts.unshift("..");
            }
        }
        return parts;
    }, normalize: function (path) {
        var isAbsolute = PATH.isAbs(path), trailingSlash = path.substr(-1) === "/";
        path = PATH.normalizeArray(path.split("/").filter(function (p) {
            return !!p;
        }), !isAbsolute).join("/");
        if (!path && !isAbsolute) {
            path = ".";
        }
        if (path && trailingSlash) {
            path += "/";
        }
        return (isAbsolute ? "/" : "") + path;
    }, dirname: function (path) {
        var result = PATH.splitPath(path), root = result[0], dir = result[1];
        if (!root && !dir) {
            return ".";
        }
        if (dir) {
            dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
    }, basename: function (path) {
        if (path === "/") {
            return "/";
        }
        path = PATH.normalize(path);
        path = path.replace(/\/$/, "");
        var lastSlash = path.lastIndexOf("/");
        if (lastSlash === -1) {
            return path;
        }
        return path.substr(lastSlash + 1);
    }, join: function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join("/"));
    }, join2: function (l, r) {
        return PATH.normalize(l + "/" + r);
    }
};
function getRandomDevice() {
    if (typeof crypto == "object" && typeof crypto["getRandomValues"] == "function") {
        var randomBuffer = new Uint8Array(1);
        return function () {
            crypto.getRandomValues(randomBuffer);
            return randomBuffer[0];
        };
    } else if (ENVIRONMENT_IS_NODE) {
        try {
            var crypto_module = require("crypto");
            return function () {
                return crypto_module["randomBytes"](1)[0];
            };
        } catch (e) {
        }
    }
    return function () {
        return abort("no cryptographic support found for randomDevice. consider polyfilling it if you want to use something insecure like Math.random(), e.g. put this in a --pre-js: var crypto = { getRandomValues: function(array) { for (var i = 0; i < array.length; i++) array[i] = (Math.random()*256)|0 } };");
    };
}
var PATH_FS = {
    resolve: function () {
        var resolvedPath = "", resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            var path = i >= 0 ? arguments[i] : FS.cwd();
            if (typeof path != "string") {
                throw new TypeError("Arguments to path.resolve must be strings");
            } else if (!path) {
                return "";
            }
            resolvedPath = path + "/" + resolvedPath;
            resolvedAbsolute = PATH.isAbs(path);
        }
        resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function (p) {
            return !!p;
        }), !resolvedAbsolute).join("/");
        return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    }, relative: function (from, to) {
        from = PATH_FS.resolve(from).substr(1);
        to = PATH_FS.resolve(to).substr(1);
        function trim(arr) {
            var start = 0;
            for (; start < arr.length; start++) {
                if (arr[start] !== "") {
                    break;
                }
            }
            var end = arr.length - 1;
            for (; end >= 0; end--) {
                if (arr[end] !== "") {
                    break;
                }
            }
            if (start > end) {
                return [];
            }
            return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split("/"));
        var toParts = trim(to.split("/"));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
            if (fromParts[i] !== toParts[i]) {
                samePartsLength = i;
                break;
            }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
            outputParts.push("..");
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join("/");
    }
};
function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
    if (dontAddNull) {
        u8array.length = numBytesWritten;
    }
    return u8array;
}
var TTY = {
    ttys: [], init: function () {
    }, shutdown: function () {
    }, register: function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
    }, stream_ops: {
        open: function (stream) {
            var tty = TTY.ttys[stream.node.rdev];
            if (!tty) {
                throw new FS.ErrnoError(43);
            }
            stream.tty = tty;
            stream.seekable = false;
        }, close: function (stream) {
            stream.tty.ops.fsync(stream.tty);
        }, fsync: function (stream) {
            stream.tty.ops.fsync(stream.tty);
        }, read: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.get_char) {
                throw new FS.ErrnoError(60);
            }
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
                var result;
                try {
                    result = stream.tty.ops.get_char(stream.tty);
                } catch (e) {
                    throw new FS.ErrnoError(29);
                }
                if (result === undefined && bytesRead === 0) {
                    throw new FS.ErrnoError(6);
                }
                if (result === null || result === undefined) {
                    break;
                }
                bytesRead++;
                buffer[offset + i] = result;
            }
            if (bytesRead) {
                stream.node.timestamp = Date.now();
            }
            return bytesRead;
        }, write: function (stream, buffer, offset, length, pos) {
            if (!stream.tty || !stream.tty.ops.put_char) {
                throw new FS.ErrnoError(60);
            }
            try {
                for (var i = 0; i < length; i++) {
                    stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
                }
            } catch (e) {
                throw new FS.ErrnoError(29);
            }
            if (length) {
                stream.node.timestamp = Date.now();
            }
            return i;
        }
    }, default_tty_ops: {
        get_char: function (tty) {
            if (!tty.input.length) {
                var result = null;
                if (ENVIRONMENT_IS_NODE) {
                    var BUFSIZE = 256;
                    var buf = Buffer.alloc(BUFSIZE);
                    var bytesRead = 0;
                    try {
                        bytesRead = fs.readSync(process.stdin.fd, buf, 0, BUFSIZE, -1);
                    } catch (e) {
                        if (e.toString().includes("EOF")) {
                            bytesRead = 0;
                        } else {
                            throw e;
                        }
                    }
                    if (bytesRead > 0) {
                        result = buf.slice(0, bytesRead).toString("utf-8");
                    } else {
                        result = null;
                    }
                } else if (typeof window != "undefined" && typeof window.prompt == "function") {
                    result = window.prompt("Input: ");
                    if (result !== null) {
                        result += "\n";
                    }
                } else if (typeof readline == "function") {
                    result = readline();
                    if (result !== null) {
                        result += "\n";
                    }
                }
                if (!result) {
                    return null;
                }
                tty.input = intArrayFromString(result, true);
            }
            return tty.input.shift();
        }, put_char: function (tty, val) {
            if (val === null || val === 10) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            } else {
                if (val != 0) {
                    tty.output.push(val);
                }
            }
        }, fsync: function (tty) {
            if (tty.output && tty.output.length > 0) {
                out(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            }
        }
    }, default_tty1_ops: {
        put_char: function (tty, val) {
            if (val === null || val === 10) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            } else {
                if (val != 0) {
                    tty.output.push(val);
                }
            }
        }, fsync: function (tty) {
            if (tty.output && tty.output.length > 0) {
                err(UTF8ArrayToString(tty.output, 0));
                tty.output = [];
            }
        }
    }
};
function zeroMemory(address, size) {
    if (!HEAPU8.fill) {
        for (var i = 0; i < size; i++) {
            HEAPU8[address + i] = 0;
        }
        return;
    }
    HEAPU8.fill(0, address, address + size);
}
function alignMemory(size, alignment) {
    assert(alignment, "alignment argument is required");
    return Math.ceil(size / alignment) * alignment;
}
function mmapAlloc(size) {
    abort("internal error: mmapAlloc called but `emscripten_builtin_memalign` native symbol not exported");
}
var MEMFS = {
    ops_table: null, mount: function (mount) {
        return MEMFS.createNode(null, "/", 16384 | 511, 0);
    }, createNode: function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
            throw new FS.ErrnoError(63);
        }
        if (!MEMFS.ops_table) {
            MEMFS.ops_table = {
                dir: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink }, stream: { llseek: MEMFS.stream_ops.llseek } }, file: {
                    node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: {
                        llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write,
                        allocate: MEMFS.stream_ops.allocate, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync
                    }
                }, link: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops }
            };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
            node.node_ops = MEMFS.ops_table.dir.node;
            node.stream_ops = MEMFS.ops_table.dir.stream;
            node.contents = {};
        } else if (FS.isFile(node.mode)) {
            node.node_ops = MEMFS.ops_table.file.node;
            node.stream_ops = MEMFS.ops_table.file.stream;
            node.usedBytes = 0;
            node.contents = null;
        } else if (FS.isLink(node.mode)) {
            node.node_ops = MEMFS.ops_table.link.node;
            node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
            node.node_ops = MEMFS.ops_table.chrdev.node;
            node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        if (parent) {
            parent.contents[name] = node;
            parent.timestamp = node.timestamp;
        }
        return node;
    }, getFileDataAsTypedArray: function (node) {
        if (!node.contents) {
            return new Uint8Array(0);
        }
        if (node.contents.subarray) {
            return node.contents.subarray(0, node.usedBytes);
        }
        return new Uint8Array(node.contents);
    }, expandFileStorage: function (node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) {
            return;
        }
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125) >>> 0);
        if (prevCapacity != 0) {
            newCapacity = Math.max(newCapacity, 256);
        }
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity);
        if (node.usedBytes > 0) {
            node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
        }
    }, resizeFileStorage: function (node, newSize) {
        if (node.usedBytes == newSize) {
            return;
        }
        if (newSize == 0) {
            node.contents = null;
            node.usedBytes = 0;
        } else {
            var oldContents = node.contents;
            node.contents = new Uint8Array(newSize);
            if (oldContents) {
                node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
            }
            node.usedBytes = newSize;
        }
    }, node_ops: {
        getattr: function (node) {
            var attr = {};
            attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
            attr.ino = node.id;
            attr.mode = node.mode;
            attr.nlink = 1;
            attr.uid = 0;
            attr.gid = 0;
            attr.rdev = node.rdev;
            if (FS.isDir(node.mode)) {
                attr.size = 4096;
            } else if (FS.isFile(node.mode)) {
                attr.size = node.usedBytes;
            } else if (FS.isLink(node.mode)) {
                attr.size = node.link.length;
            } else {
                attr.size = 0;
            }
            attr.atime = new Date(node.timestamp);
            attr.mtime = new Date(node.timestamp);
            attr.ctime = new Date(node.timestamp);
            attr.blksize = 4096;
            attr.blocks = Math.ceil(attr.size / attr.blksize);
            return attr;
        }, setattr: function (node, attr) {
            if (attr.mode !== undefined) {
                node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
                node.timestamp = attr.timestamp;
            }
            if (attr.size !== undefined) {
                MEMFS.resizeFileStorage(node, attr.size);
            }
        }, lookup: function (parent, name) {
            throw FS.genericErrors[44];
        }, mknod: function (parent, name, mode, dev) {
            return MEMFS.createNode(parent, name, mode, dev);
        }, rename: function (old_node, new_dir, new_name) {
            if (FS.isDir(old_node.mode)) {
                var new_node;
                try {
                    new_node = FS.lookupNode(new_dir, new_name);
                } catch (e) {
                }
                if (new_node) {
                    for (var i in new_node.contents) {
                        throw new FS.ErrnoError(55);
                    }
                }
            }
            delete old_node.parent.contents[old_node.name];
            old_node.parent.timestamp = Date.now();
            old_node.name = new_name;
            new_dir.contents[new_name] = old_node;
            new_dir.timestamp = old_node.parent.timestamp;
            old_node.parent = new_dir;
        }, unlink: function (parent, name) {
            delete parent.contents[name];
            parent.timestamp = Date.now();
        }, rmdir: function (parent, name) {
            var node = FS.lookupNode(parent, name);
            for (var i in node.contents) {
                throw new FS.ErrnoError(55);
            }
            delete parent.contents[name];
            parent.timestamp = Date.now();
        }, readdir: function (node) {
            var entries = [".", ".."];
            for (var key in node.contents) {
                if (!node.contents.hasOwnProperty(key)) {
                    continue;
                }
                entries.push(key);
            }
            return entries;
        }, symlink: function (parent, newname, oldpath) {
            var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
            node.link = oldpath;
            return node;
        }, readlink: function (node) {
            if (!FS.isLink(node.mode)) {
                throw new FS.ErrnoError(28);
            }
            return node.link;
        }
    }, stream_ops: {
        read: function (stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= stream.node.usedBytes) {
                return 0;
            }
            var size = Math.min(stream.node.usedBytes - position, length);
            assert(size >= 0);
            if (size > 8 && contents.subarray) {
                buffer.set(contents.subarray(position, position + size), offset);
            } else {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i];
                }
            }
            return size;
        }, write: function (stream, buffer, offset, length, position, canOwn) {
            assert(!(buffer instanceof ArrayBuffer));
            if (buffer.buffer === HEAP8.buffer) {
                canOwn = false;
            }
            if (!length) {
                return 0;
            }
            var node = stream.node;
            node.timestamp = Date.now();
            if (buffer.subarray && (!node.contents || node.contents.subarray)) {
                if (canOwn) {
                    assert(position === 0, "canOwn must imply no weird position inside the file");
                    node.contents = buffer.subarray(offset, offset + length);
                    node.usedBytes = length;
                    return length;
                } else if (node.usedBytes === 0 && position === 0) {
                    node.contents = buffer.slice(offset, offset + length);
                    node.usedBytes = length;
                    return length;
                } else if (position + length <= node.usedBytes) {
                    node.contents.set(buffer.subarray(offset, offset + length), position);
                    return length;
                }
            }
            MEMFS.expandFileStorage(node, position + length);
            if (node.contents.subarray && buffer.subarray) {
                node.contents.set(buffer.subarray(offset, offset + length), position);
            } else {
                for (var i = 0; i < length; i++) {
                    node.contents[position + i] = buffer[offset + i];
                }
            }
            node.usedBytes = Math.max(node.usedBytes, position + length);
            return length;
        }, llseek: function (stream, offset, whence) {
            var position = offset;
            if (whence === 1) {
                position += stream.position;
            } else if (whence === 2) {
                if (FS.isFile(stream.node.mode)) {
                    position += stream.node.usedBytes;
                }
            }
            if (position < 0) {
                throw new FS.ErrnoError(28);
            }
            return position;
        }, allocate: function (stream, offset, length) {
            MEMFS.expandFileStorage(stream.node, offset + length);
            stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
        }, mmap: function (stream, length, position, prot, flags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43);
            }
            var ptr;
            var allocated;
            var contents = stream.node.contents;
            if (!(flags & 2) && contents.buffer === buffer) {
                allocated = false;
                ptr = contents.byteOffset;
            } else {
                if (position > 0 || position + length < contents.length) {
                    if (contents.subarray) {
                        contents = contents.subarray(position, position + length);
                    } else {
                        contents = Array.prototype.slice.call(contents, position, position + length);
                    }
                }
                allocated = true;
                ptr = mmapAlloc(length);
                if (!ptr) {
                    throw new FS.ErrnoError(48);
                }
                HEAP8.set(contents, ptr);
            }
            return { ptr: ptr, allocated: allocated };
        }, msync: function (stream, buffer, offset, length, mmapFlags) {
            if (!FS.isFile(stream.node.mode)) {
                throw new FS.ErrnoError(43);
            }
            if (mmapFlags & 2) {
                return 0;
            }
            var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
            return 0;
        }
    }
};
function asyncLoad(url, onload, onerror, noRunDep) {
    var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
    readAsync(url, function (arrayBuffer) {
        assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
        onload(new Uint8Array(arrayBuffer));
        if (dep) {
            removeRunDependency(dep);
        }
    }, function (event) {
        if (onerror) {
            onerror();
        } else {
            throw 'Loading data file "' + url + '" failed.';
        }
    });
    if (dep) {
        addRunDependency(dep);
    }
}
var ERRNO_MESSAGES = {
    0: "Success", 1: "Arg list too long", 2: "Permission denied", 3: "Address already in use", 4: "Address not available", 5: "Address family not supported by protocol family", 6: "No more processes", 7: "Socket already connected", 8: "Bad file number", 9: "Trying to read unreadable message", 10: "Mount device busy", 11: "Operation canceled", 12: "No children", 13: "Connection aborted", 14: "Connection refused", 15: "Connection reset by peer", 16: "File locking deadlock error", 17: "Destination address required",
    18: "Math arg out of domain of func", 19: "Quota exceeded", 20: "File exists", 21: "Bad address", 22: "File too large", 23: "Host is unreachable", 24: "Identifier removed", 25: "Illegal byte sequence", 26: "Connection already in progress", 27: "Interrupted system call", 28: "Invalid argument", 29: "I/O error", 30: "Socket is already connected", 31: "Is a directory", 32: "Too many symbolic links", 33: "Too many open files", 34: "Too many links", 35: "Message too long", 36: "Multihop attempted", 37: "File or path name too long",
    38: "Network interface is not configured", 39: "Connection reset by network", 40: "Network is unreachable", 41: "Too many open files in system", 42: "No buffer space available", 43: "No such device", 44: "No such file or directory", 45: "Exec format error", 46: "No record locks available", 47: "The link has been severed", 48: "Not enough core", 49: "No message of desired type", 50: "Protocol not available", 51: "No space left on device", 52: "Function not implemented", 53: "Socket is not connected", 54: "Not a directory",
    55: "Directory not empty", 56: "State not recoverable", 57: "Socket operation on non-socket", 59: "Not a typewriter", 60: "No such device or address", 61: "Value too large for defined data type", 62: "Previous owner died", 63: "Not super-user", 64: "Broken pipe", 65: "Protocol error", 66: "Unknown protocol", 67: "Protocol wrong type for socket", 68: "Math result not representable", 69: "Read only file system", 70: "Illegal seek", 71: "No such process", 72: "Stale file handle", 73: "Connection timed out", 74: "Text file busy",
    75: "Cross-device link", 100: "Device not a stream", 101: "Bad font file fmt", 102: "Invalid slot", 103: "Invalid request code", 104: "No anode", 105: "Block device required", 106: "Channel number out of range", 107: "Level 3 halted", 108: "Level 3 reset", 109: "Link number out of range", 110: "Protocol driver not attached", 111: "No CSI structure available", 112: "Level 2 halted", 113: "Invalid exchange", 114: "Invalid request descriptor", 115: "Exchange full", 116: "No data (for no delay io)", 117: "Timer expired",
    118: "Out of streams resources", 119: "Machine is not on the network", 120: "Package not installed", 121: "The object is remote", 122: "Advertise error", 123: "Srmount error", 124: "Communication error on send", 125: "Cross mount point (not really error)", 126: "Given log. name not unique", 127: "f.d. invalid for this operation", 128: "Remote address changed", 129: "Can   access a needed shared lib", 130: "Accessing a corrupted shared lib", 131: ".lib section in a.out corrupted", 132: "Attempting to link in too many libs",
    133: "Attempting to exec a shared library", 135: "Streams pipe error", 136: "Too many users", 137: "Socket type not supported", 138: "Not supported", 139: "Protocol family not supported", 140: "Can't send after socket shutdown", 141: "Too many references", 142: "Host is down", 148: "No medium (in tape drive)", 156: "Level 2 not synchronized"
};
var ERRNO_CODES = {};
var FS = {
    root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, ErrnoError: null, genericErrors: {}, filesystems: null, syncFSRequests: 0, lookupPath: function (path, opts) {
        opts = opts === void 0 ? {} : opts;
        path = PATH_FS.resolve(FS.cwd(), path);
        if (!path) {
            return { path: "", node: null };
        }
        var defaults = { follow_mount: true, recurse_count: 0 };
        opts = Object.assign(defaults, opts);
        if (opts.recurse_count > 8) {
            throw new FS.ErrnoError(32);
        }
        var parts = PATH.normalizeArray(path.split("/").filter(function (p) {
            return !!p;
        }), false);
        var current = FS.root;
        var current_path = "/";
        for (var i = 0; i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
                break;
            }
            current = FS.lookupNode(current, parts[i]);
            current_path = PATH.join2(current_path, parts[i]);
            if (FS.isMountpoint(current)) {
                if (!islast || islast && opts.follow_mount) {
                    current = current.mounted.root;
                }
            }
            if (!islast || opts.follow) {
                var count = 0;
                while (FS.isLink(current.mode)) {
                    var link = FS.readlink(current_path);
                    current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
                    var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
                    current = lookup.node;
                    if (count++ > 40) {
                        throw new FS.ErrnoError(32);
                    }
                }
            }
        }
        return { path: current_path, node: current };
    }, getPath: function (node) {
        var path;
        while (true) {
            if (FS.isRoot(node)) {
                var mount = node.mount.mountpoint;
                if (!path) {
                    return mount;
                }
                return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
            }
            path = path ? node.name + "/" + path : node.name;
            node = node.parent;
        }
    }, hashName: function (parentid, name) {
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
        }
        return (parentid + hash >>> 0) % FS.nameTable.length;
    }, hashAddNode: function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
    }, hashRemoveNode: function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
            FS.nameTable[hash] = node.name_next;
        } else {
            var current = FS.nameTable[hash];
            while (current) {
                if (current.name_next === node) {
                    current.name_next = node.name_next;
                    break;
                }
                current = current.name_next;
            }
        }
    }, lookupNode: function (parent, name) {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
            throw new FS.ErrnoError(errCode, parent);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
            var nodeName = node.name;
            if (node.parent.id === parent.id && nodeName === name) {
                return node;
            }
        }
        return FS.lookup(parent, name);
    }, createNode: function (parent, name, mode, rdev) {
        assert(typeof parent == "object");
        var node = new FS.FSNode(parent, name, mode, rdev);
        FS.hashAddNode(node);
        return node;
    }, destroyNode: function (node) {
        FS.hashRemoveNode(node);
    }, isRoot: function (node) {
        return node === node.parent;
    }, isMountpoint: function (node) {
        return !!node.mounted;
    }, isFile: function (mode) {
        return (mode & 61440) === 32768;
    }, isDir: function (mode) {
        return (mode & 61440) === 16384;
    }, isLink: function (mode) {
        return (mode & 61440) === 40960;
    }, isChrdev: function (mode) {
        return (mode & 61440) === 8192;
    }, isBlkdev: function (mode) {
        return (mode & 61440) === 24576;
    }, isFIFO: function (mode) {
        return (mode & 61440) === 4096;
    }, isSocket: function (mode) {
        return (mode & 49152) === 49152;
    }, flagModes: { "r": 0, "r+": 2, "w": 577, "w+": 578, "a": 1089, "a+": 1090 }, modeStringToFlags: function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags == "undefined") {
            throw new Error("Unknown file open mode: " + str);
        }
        return flags;
    }, flagsToPermissionString: function (flag) {
        var perms = ["r", "w", "rw"][flag & 3];
        if (flag & 512) {
            perms += "w";
        }
        return perms;
    }, nodePermissions: function (node, perms) {
        if (FS.ignorePermissions) {
            return 0;
        }
        if (perms.includes("r") && !(node.mode & 292)) {
            return 2;
        } else if (perms.includes("w") && !(node.mode & 146)) {
            return 2;
        } else if (perms.includes("x") && !(node.mode & 73)) {
            return 2;
        }
        return 0;
    }, mayLookup: function (dir) {
        var errCode = FS.nodePermissions(dir, "x");
        if (errCode) {
            return errCode;
        }
        if (!dir.node_ops.lookup) {
            return 2;
        }
        return 0;
    }, mayCreate: function (dir, name) {
        try {
            var node = FS.lookupNode(dir, name);
            return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, "wx");
    }, mayDelete: function (dir, name, isdir) {
        var node;
        try {
            node = FS.lookupNode(dir, name);
        } catch (e) {
            return e.errno;
        }
        var errCode = FS.nodePermissions(dir, "wx");
        if (errCode) {
            return errCode;
        }
        if (isdir) {
            if (!FS.isDir(node.mode)) {
                return 54;
            }
            if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
                return 10;
            }
        } else {
            if (FS.isDir(node.mode)) {
                return 31;
            }
        }
        return 0;
    }, mayOpen: function (node, flags) {
        if (!node) {
            return 44;
        }
        if (FS.isLink(node.mode)) {
            return 32;
        } else if (FS.isDir(node.mode)) {
            if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
                return 31;
            }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    }, MAX_OPEN_FDS: 4096, nextfd: function (fd_start, fd_end) {
        fd_start = fd_start === void 0 ? 0 : fd_start;
        fd_end = fd_end === void 0 ? FS.MAX_OPEN_FDS : fd_end;
        for (var fd = fd_start; fd <= fd_end; fd++) {
            if (!FS.streams[fd]) {
                return fd;
            }
        }
        throw new FS.ErrnoError(33);
    }, getStream: function (fd) {
        return FS.streams[fd];
    }, createStream: function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
            FS.FSStream = function () {
                this.shared = {};
            };
            FS.FSStream.prototype = {};
            Object.defineProperties(FS.FSStream.prototype, {
                object: {
                    get: function () {
                        return this.node;
                    }, set: function (val) {
                        this.node = val;
                    }
                }, isRead: {
                    get: function () {
                        return (this.flags & 2097155) !== 1;
                    }
                }, isWrite: {
                    get: function () {
                        return (this.flags & 2097155) !== 0;
                    }
                }, isAppend: {
                    get: function () {
                        return this.flags & 1024;
                    }
                }, flags: {
                    get: function () {
                        return this.shared.flags;
                    }, set: function (val) {
                        this.shared.flags = val;
                    },
                }, position: {
                    get: function () {
                        return this.shared.position;
                    }, set: function (val) {
                        this.shared.position = val;
                    },
                },
            });
        }
        stream = Object.assign(new FS.FSStream(), stream);
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
    }, closeStream: function (fd) {
        FS.streams[fd] = null;
    }, chrdev_stream_ops: {
        open: function (stream) {
            var device = FS.getDevice(stream.node.rdev);
            stream.stream_ops = device.stream_ops;
            if (stream.stream_ops.open) {
                stream.stream_ops.open(stream);
            }
        }, llseek: function () {
            throw new FS.ErrnoError(70);
        }
    }, major: function (dev) {
        return dev >> 8;
    }, minor: function (dev) {
        return dev & 255;
    }, makedev: function (ma, mi) {
        return ma << 8 | mi;
    }, registerDevice: function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
    }, getDevice: function (dev) {
        return FS.devices[dev];
    }, getMounts: function (mount) {
        var mounts = [];
        var check = [mount];
        while (check.length) {
            var m = check.pop();
            mounts.push(m);
            check.push.apply(check, m.mounts);
        }
        return mounts;
    }, syncfs: function (populate, callback) {
        if (typeof populate == "function") {
            callback = populate;
            populate = false;
        }
        FS.syncFSRequests++;
        if (FS.syncFSRequests > 1) {
            err("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
        }
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
        function doCallback(errCode) {
            assert(FS.syncFSRequests > 0);
            FS.syncFSRequests--;
            return callback(errCode);
        }
        function done(errCode) {
            if (errCode) {
                if (!done.errored) {
                    done.errored = true;
                    return doCallback(errCode);
                }
                return;
            }
            if (++completed >= mounts.length) {
                doCallback(null);
            }
        }
        mounts.forEach(function (mount) {
            if (!mount.type.syncfs) {
                return done(null);
            }
            mount.type.syncfs(mount, populate, done);
        });
    }, mount: function (type, opts, mountpoint) {
        if (typeof type == "string") {
            throw type;
        }
        var root = mountpoint === "/";
        var pseudo = !mountpoint;
        var node;
        if (root && FS.root) {
            throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
            var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
            mountpoint = lookup.path;
            node = lookup.node;
            if (FS.isMountpoint(node)) {
                throw new FS.ErrnoError(10);
            }
            if (!FS.isDir(node.mode)) {
                throw new FS.ErrnoError(54);
            }
        }
        var mount = { type: type, opts: opts, mountpoint: mountpoint, mounts: [] };
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
        if (root) {
            FS.root = mountRoot;
        } else if (node) {
            node.mounted = mount;
            if (node.mount) {
                node.mount.mounts.push(mount);
            }
        }
        return mountRoot;
    }, unmount: function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        if (!FS.isMountpoint(lookup.node)) {
            throw new FS.ErrnoError(28);
        }
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
        Object.keys(FS.nameTable).forEach(function (hash) {
            var current = FS.nameTable[hash];
            while (current) {
                var next = current.name_next;
                if (mounts.includes(current.mount)) {
                    FS.destroyNode(current);
                }
                current = next;
            }
        });
        node.mounted = null;
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
    }, lookup: function (parent, name) {
        return parent.node_ops.lookup(parent, name);
    }, mknod: function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name || name === "." || name === "..") {
            throw new FS.ErrnoError(28);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
            throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
    }, create: function (path, mode) {
        mode = mode !== undefined ? mode : 438;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
    }, mkdir: function (path, mode) {
        mode = mode !== undefined ? mode : 511;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
    }, mkdirTree: function (path, mode) {
        var dirs = path.split("/");
        var d = "";
        for (var i = 0; i < dirs.length; ++i) {
            if (!dirs[i]) {
                continue;
            }
            d += "/" + dirs[i];
            try {
                FS.mkdir(d, mode);
            } catch (e) {
                if (e.errno != 20) {
                    throw e;
                }
            }
        }
    }, mkdev: function (path, mode, dev) {
        if (typeof dev == "undefined") {
            dev = mode;
            mode = 438;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
    }, symlink: function (oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
            throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
            throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
    }, rename: function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        var lookup, old_dir, new_dir;
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
        if (!old_dir || !new_dir) {
            throw new FS.ErrnoError(44);
        }
        if (old_dir.mount !== new_dir.mount) {
            throw new FS.ErrnoError(75);
        }
        var old_node = FS.lookupNode(old_dir, old_name);
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(28);
        }
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== ".") {
            throw new FS.ErrnoError(55);
        }
        var new_node;
        try {
            new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
        }
        if (old_node === new_node) {
            return;
        }
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
            throw new FS.ErrnoError(10);
        }
        if (new_dir !== old_dir) {
            errCode = FS.nodePermissions(old_dir, "w");
            if (errCode) {
                throw new FS.ErrnoError(errCode);
            }
        }
        FS.hashRemoveNode(old_node);
        try {
            old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e$1) {
            throw e$1;
        } finally {
            FS.hashAddNode(old_node);
        }
    }, rmdir: function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
    }, readdir: function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
            throw new FS.ErrnoError(54);
        }
        return node.node_ops.readdir(node);
    }, unlink: function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
            throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
    }, readlink: function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
            throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
            throw new FS.ErrnoError(28);
        }
        return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
    }, stat: function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node) {
            throw new FS.ErrnoError(44);
        }
        if (!node.node_ops.getattr) {
            throw new FS.ErrnoError(63);
        }
        return node.node_ops.getattr(node);
    }, lstat: function (path) {
        return FS.stat(path, true);
    }, chmod: function (path, mode, dontFollow) {
        var node;
        if (typeof path == "string") {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
        } else {
            node = path;
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, { mode: mode & 4095 | node.mode & ~4095, timestamp: Date.now() });
    }, lchmod: function (path, mode) {
        FS.chmod(path, mode, true);
    }, fchmod: function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        FS.chmod(stream.node, mode);
    }, chown: function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path == "string") {
            var lookup = FS.lookupPath(path, { follow: !dontFollow });
            node = lookup.node;
        } else {
            node = path;
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
        }
        node.node_ops.setattr(node, { timestamp: Date.now() });
    }, lchown: function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
    }, fchown: function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        FS.chown(stream.node, uid, gid);
    }, truncate: function (path, len) {
        if (len < 0) {
            throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == "string") {
            var lookup = FS.lookupPath(path, { follow: true });
            node = lookup.node;
        } else {
            node = path;
        }
        if (!node.node_ops.setattr) {
            throw new FS.ErrnoError(63);
        }
        if (FS.isDir(node.mode)) {
            throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
            throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, "w");
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
    }, ftruncate: function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(28);
        }
        FS.truncate(stream.node, len);
    }, utime: function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
    }, open: function (path, flags, mode) {
        if (path === "") {
            throw new FS.ErrnoError(44);
        }
        flags = typeof flags == "string" ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode == "undefined" ? 438 : mode;
        if (flags & 64) {
            mode = mode & 4095 | 32768;
        } else {
            mode = 0;
        }
        var node;
        if (typeof path == "object") {
            node = path;
        } else {
            path = PATH.normalize(path);
            try {
                var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
                node = lookup.node;
            } catch (e) {
            }
        }
        var created = false;
        if (flags & 64) {
            if (node) {
                if (flags & 128) {
                    throw new FS.ErrnoError(20);
                }
            } else {
                node = FS.mknod(path, mode, 0);
                created = true;
            }
        }
        if (!node) {
            throw new FS.ErrnoError(44);
        }
        if (FS.isChrdev(node.mode)) {
            flags &= ~512;
        }
        if (flags & 65536 && !FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
        }
        if (!created) {
            var errCode = FS.mayOpen(node, flags);
            if (errCode) {
                throw new FS.ErrnoError(errCode);
            }
        }
        if (flags & 512 && !created) {
            FS.truncate(node, 0);
        }
        flags &= ~(128 | 512 | 131072);
        var stream = FS.createStream({ node: node, path: FS.getPath(node), flags: flags, seekable: true, position: 0, stream_ops: node.stream_ops, ungotten: [], error: false });
        if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
        }
        if (Module["logReadFiles"] && !(flags & 1)) {
            if (!FS.readFiles) {
                FS.readFiles = {};
            }
            if (!(path in FS.readFiles)) {
                FS.readFiles[path] = 1;
            }
        }
        return stream;
    }, close: function (stream) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if (stream.getdents) {
            stream.getdents = null;
        }
        try {
            if (stream.stream_ops.close) {
                stream.stream_ops.close(stream);
            }
        } catch (e) {
            throw e;
        } finally {
            FS.closeStream(stream.fd);
        }
        stream.fd = null;
    }, isClosed: function (stream) {
        return stream.fd === null;
    }, llseek: function (stream, offset, whence) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
            throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
            throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
    }, read: function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
            throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != "undefined";
        if (!seeking) {
            position = stream.position;
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) {
            stream.position += bytesRead;
        }
        return bytesRead;
    }, write: function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
            throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
            throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
            FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != "undefined";
        if (!seeking) {
            position = stream.position;
        } else if (!stream.seekable) {
            throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) {
            stream.position += bytesWritten;
        }
        return bytesWritten;
    }, allocate: function (stream, offset, length) {
        if (FS.isClosed(stream)) {
            throw new FS.ErrnoError(8);
        }
        if (offset < 0 || length <= 0) {
            throw new FS.ErrnoError(28);
        }
        if ((stream.flags & 2097155) === 0) {
            throw new FS.ErrnoError(8);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
            throw new FS.ErrnoError(43);
        }
        if (!stream.stream_ops.allocate) {
            throw new FS.ErrnoError(138);
        }
        stream.stream_ops.allocate(stream, offset, length);
    }, mmap: function (stream, length, position, prot, flags) {
        if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
            throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
            throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
            throw new FS.ErrnoError(43);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
    }, msync: function (stream, buffer, offset, length, mmapFlags) {
        if (!stream || !stream.stream_ops.msync) {
            return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
    }, munmap: function (stream) {
        return 0;
    }, ioctl: function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
            throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
    }, readFile: function (path, opts) {
        opts = opts === void 0 ? {} : opts;
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || "binary";
        if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
            throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === "utf8") {
            ret = UTF8ArrayToString(buf, 0);
        } else if (opts.encoding === "binary") {
            ret = buf;
        }
        FS.close(stream);
        return ret;
    }, writeFile: function (path, data, opts) {
        opts = opts === void 0 ? {} : opts;
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == "string") {
            var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
            var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
            FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
        } else if (ArrayBuffer.isView(data)) {
            FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
            throw new Error("Unsupported data type");
        }
        FS.close(stream);
    }, cwd: function () {
        return FS.currentPath;
    }, chdir: function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
            throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
            throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, "x");
        if (errCode) {
            throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
    }, createDefaultDirectories: function () {
        FS.mkdir("/tmp");
        FS.mkdir("/home");
        FS.mkdir("/home/web_user");
    }, createDefaultDevices: function () {
        FS.mkdir("/dev");
        FS.registerDevice(FS.makedev(1, 3), {
            read: function () {
                return 0;
            }, write: function (stream, buffer, offset, length, pos) {
                return length;
            },
        });
        FS.mkdev("/dev/null", FS.makedev(1, 3));
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev("/dev/tty", FS.makedev(5, 0));
        FS.mkdev("/dev/tty1", FS.makedev(6, 0));
        var random_device = getRandomDevice();
        FS.createDevice("/dev", "random", random_device);
        FS.createDevice("/dev", "urandom", random_device);
        FS.mkdir("/dev/shm");
        FS.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories: function () {
        FS.mkdir("/proc");
        var proc_self = FS.mkdir("/proc/self");
        FS.mkdir("/proc/self/fd");
        FS.mount({
            mount: function () {
                var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
                node.node_ops = {
                    lookup: function (parent, name) {
                        var fd = +name;
                        var stream = FS.getStream(fd);
                        if (!stream) {
                            throw new FS.ErrnoError(8);
                        }
                        var ret = {
                            parent: null, mount: { mountpoint: "fake" }, node_ops: {
                                readlink: function () {
                                    return stream.path;
                                }
                            },
                        };
                        ret.parent = ret;
                        return ret;
                    }
                };
                return node;
            }
        }, {}, "/proc/self/fd");
    }, createStandardStreams: function () {
        if (Module["stdin"]) {
            FS.createDevice("/dev", "stdin", Module["stdin"]);
        } else {
            FS.symlink("/dev/tty", "/dev/stdin");
        }
        if (Module["stdout"]) {
            FS.createDevice("/dev", "stdout", null, Module["stdout"]);
        } else {
            FS.symlink("/dev/tty", "/dev/stdout");
        }
        if (Module["stderr"]) {
            FS.createDevice("/dev", "stderr", null, Module["stderr"]);
        } else {
            FS.symlink("/dev/tty1", "/dev/stderr");
        }
        var stdin = FS.open("/dev/stdin", 0);
        var stdout = FS.open("/dev/stdout", 1);
        var stderr = FS.open("/dev/stderr", 1);
        assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
        assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
        assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")");
    }, ensureErrnoError: function () {
        if (FS.ErrnoError) {
            return;
        }
        FS.ErrnoError = function ErrnoError(errno, node) {
            this.node = node;
            this.setErrno = function (errno) {
                this.errno = errno;
                for (var key in ERRNO_CODES) {
                    if (ERRNO_CODES[key] === errno) {
                        this.code = key;
                        break;
                    }
                }
            };
            this.setErrno(errno);
            this.message = ERRNO_MESSAGES[errno];
            if (this.stack) {
                Object.defineProperty(this, "stack", { value: (new Error()).stack, writable: true });
                this.stack = demangleAll(this.stack);
            }
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        [44].forEach(function (code) {
            FS.genericErrors[code] = new FS.ErrnoError(code);
            FS.genericErrors[code].stack = "<generic error, no stack>";
        });
    }, staticInit: function () {
        FS.ensureErrnoError();
        FS.nameTable = new Array(4096);
        FS.mount(MEMFS, {}, "/");
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
        FS.filesystems = { "MEMFS": MEMFS, };
    }, init: function (input, output, error) {
        assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
        FS.init.initialized = true;
        FS.ensureErrnoError();
        Module["stdin"] = input || Module["stdin"];
        Module["stdout"] = output || Module["stdout"];
        Module["stderr"] = error || Module["stderr"];
        FS.createStandardStreams();
    }, quit: function () {
        FS.init.initialized = false;
        _fflush(0);
        for (var i = 0; i < FS.streams.length; i++) {
            var stream = FS.streams[i];
            if (!stream) {
                continue;
            }
            FS.close(stream);
        }
    }, getMode: function (canRead, canWrite) {
        var mode = 0;
        if (canRead) {
            mode |= 292 | 73;
        }
        if (canWrite) {
            mode |= 146;
        }
        return mode;
    }, findObject: function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
            return null;
        }
        return ret.object;
    }, analyzePath: function (path, dontResolveLastLink) {
        try {
            var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            path = lookup.path;
        } catch (e) {
        }
        var ret = { isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null };
        try {
            var lookup = FS.lookupPath(path, { parent: true });
            ret.parentExists = true;
            ret.parentPath = lookup.path;
            ret.parentObject = lookup.node;
            ret.name = PATH.basename(path);
            lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
            ret.exists = true;
            ret.path = lookup.path;
            ret.object = lookup.node;
            ret.name = lookup.node.name;
            ret.isRoot = lookup.path === "/";
        } catch (e$2) {
            ret.error = e$2.errno;
        }
        return ret;
    }, createPath: function (parent, path, canRead, canWrite) {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        var parts = path.split("/").reverse();
        while (parts.length) {
            var part = parts.pop();
            if (!part) {
                continue;
            }
            var current = PATH.join2(parent, part);
            try {
                FS.mkdir(current);
            } catch (e) {
            }
            parent = current;
        }
        return current;
    }, createFile: function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
    }, createDataFile: function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name;
        if (parent) {
            parent = typeof parent == "string" ? parent : FS.getPath(parent);
            path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
            if (typeof data == "string") {
                var arr = new Array(data.length);
                for (var i = 0, len = data.length; i < len; ++i) {
                    arr[i] = data.charCodeAt(i);
                }
                data = arr;
            }
            FS.chmod(node, mode | 146);
            var stream = FS.open(node, 577);
            FS.write(stream, data, 0, data.length, 0, canOwn);
            FS.close(stream);
            FS.chmod(node, mode);
        }
        return node;
    }, createDevice: function (parent, name, input, output) {
        var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) {
            FS.createDevice.major = 64;
        }
        var dev = FS.makedev(FS.createDevice.major++, 0);
        FS.registerDevice(dev, {
            open: function (stream) {
                stream.seekable = false;
            }, close: function (stream) {
                if (output && output.buffer && output.buffer.length) {
                    output(10);
                }
            }, read: function (stream, buffer, offset, length, pos) {
                var bytesRead = 0;
                for (var i = 0; i < length; i++) {
                    var result;
                    try {
                        result = input();
                    } catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                    if (result === undefined && bytesRead === 0) {
                        throw new FS.ErrnoError(6);
                    }
                    if (result === null || result === undefined) {
                        break;
                    }
                    bytesRead++;
                    buffer[offset + i] = result;
                }
                if (bytesRead) {
                    stream.node.timestamp = Date.now();
                }
                return bytesRead;
            }, write: function (stream, buffer, offset, length, pos) {
                for (var i = 0; i < length; i++) {
                    try {
                        output(buffer[offset + i]);
                    } catch (e) {
                        throw new FS.ErrnoError(29);
                    }
                }
                if (length) {
                    stream.node.timestamp = Date.now();
                }
                return i;
            }
        });
        return FS.mkdev(path, mode, dev);
    }, forceLoadFile: function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) {
            return true;
        }
        if (typeof XMLHttpRequest != "undefined") {
            throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (read_) {
            try {
                obj.contents = intArrayFromString(read_(obj.url), true);
                obj.usedBytes = obj.contents.length;
            } catch (e) {
                throw new FS.ErrnoError(29);
            }
        } else {
            throw new Error("Cannot load without read() or XMLHttpRequest.");
        }
    }, createLazyFile: function (parent, name, url, canRead, canWrite) {
        function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = [];
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length - 1 || idx < 0) {
                return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = idx / this.chunkSize | 0;
            return this.getter(chunkNum)[chunkOffset];
        };
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
        };
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            var xhr = new XMLHttpRequest();
            xhr.open("HEAD", url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) {
                throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            }
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
            var chunkSize = 1024 * 1024;
            if (!hasByteServing) {
                chunkSize = datalength;
            }
            var doXHR = function (from, to) {
                if (from > to) {
                    throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                }
                if (to > datalength - 1) {
                    throw new Error("only " + datalength + " bytes available! programmer error!");
                }
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                if (datalength !== chunkSize) {
                    xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                }
                xhr.responseType = "arraybuffer";
                if (xhr.overrideMimeType) {
                    xhr.overrideMimeType("text/plain; charset=x-user-defined");
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) {
                    throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                }
                if (xhr.response !== undefined) {
                    return new Uint8Array(xhr.response || []);
                }
                return intArrayFromString(xhr.responseText || "", true);
            };
            var lazyArray = this;
            lazyArray.setDataGetter(function (chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum + 1) * chunkSize - 1;
                end = Math.min(end, datalength - 1);
                if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                    lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof lazyArray.chunks[chunkNum] == "undefined") {
                    throw new Error("doXHR failed!");
                }
                return lazyArray.chunks[chunkNum];
            });
            if (usesGzip || !datalength) {
                chunkSize = datalength = 1;
                datalength = this.getter(0).length;
                chunkSize = datalength;
                out("LazyFiles on gzip forces download of the whole file when length is accessed");
            }
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        };
        if (typeof XMLHttpRequest != "undefined") {
            if (!ENVIRONMENT_IS_WORKER) {
                throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
            }
            var lazyArray = new LazyUint8Array();
            Object.defineProperties(lazyArray, {
                length: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength();
                        }
                        return this._length;
                    }
                }, chunkSize: {
                    get: function () {
                        if (!this.lengthKnown) {
                            this.cacheLength();
                        }
                        return this._chunkSize;
                    }
                }
            });
            var properties = { isDevice: false, contents: lazyArray };
        } else {
            var properties = { isDevice: false, url: url };
        }
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        if (properties.contents) {
            node.contents = properties.contents;
        } else if (properties.url) {
            node.contents = null;
            node.url = properties.url;
        }
        Object.defineProperties(node, {
            usedBytes: {
                get: function () {
                    return this.contents.length;
                }
            }
        });
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function (key) {
            var fn = node.stream_ops[key];
            stream_ops[key] = function forceLoadLazyFile() {
                FS.forceLoadFile(node);
                return fn.apply(null, arguments);
            };
        });
        function writeChunks(stream, buffer, offset, length, position) {
            var contents = stream.node.contents;
            if (position >= contents.length) {
                return 0;
            }
            var size = Math.min(contents.length - position, length);
            assert(size >= 0);
            if (contents.slice) {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents[position + i];
                }
            } else {
                for (var i = 0; i < size; i++) {
                    buffer[offset + i] = contents.get(position + i);
                }
            }
            return size;
        }
        stream_ops.read = function (stream, buffer, offset, length, position) {
            FS.forceLoadFile(node);
            return writeChunks(stream, buffer, offset, length, position);
        };
        stream_ops.mmap = function (stream, length, position, prot, flags) {
            FS.forceLoadFile(node);
            var ptr = mmapAlloc(length);
            if (!ptr) {
                throw new FS.ErrnoError(48);
            }
            writeChunks(stream, HEAP8, ptr, length, position);
            return { ptr: ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
    }, createPreloadedFile: function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
        var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
        var dep = getUniqueRunDependency("cp " + fullname);
        function processData(byteArray) {
            function finish(byteArray) {
                if (preFinish) {
                    preFinish();
                }
                if (!dontCreateFile) {
                    FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
                }
                if (onload) {
                    onload();
                }
                removeRunDependency(dep);
            }
            if (Browser.handledByPreloadPlugin(byteArray, fullname, finish, function () {
                if (onerror) {
                    onerror();
                }
                removeRunDependency(dep);
            })) {
                return;
            }
            finish(byteArray);
        }
        addRunDependency(dep);
        if (typeof url == "string") {
            asyncLoad(url, function (byteArray) {
                return processData(byteArray);
            }, onerror);
        } else {
            processData(url);
        }
    }, indexedDB: function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }, DB_NAME: function () {
        return "EM_FS_" + window.location.pathname;
    }, DB_VERSION: 20, DB_STORE_NAME: "FILE_DATA", saveFilesToDB: function (paths, onload, onerror) {
        onload = onload || function () {
        };
        onerror = onerror || function () {
        };
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
            return onerror(e);
        }
        openRequest.onupgradeneeded = function () {
            out("creating db");
            var db = openRequest.result;
            db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function () {
            var db = openRequest.result;
            var transaction = db.transaction([FS.DB_STORE_NAME], "readwrite");
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0, fail = 0, total = paths.length;
            function finish() {
                if (fail == 0) {
                    onload();
                } else {
                    onerror();
                }
            }
            paths.forEach(function (path) {
                var putRequest = files.put(FS.analyzePath(path).object.contents, path);
                putRequest.onsuccess = function () {
                    ok++;
                    if (ok + fail == total) {
                        finish();
                    }
                };
                putRequest.onerror = function () {
                    fail++;
                    if (ok + fail == total) {
                        finish();
                    }
                };
            });
            transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
    }, loadFilesFromDB: function (paths, onload, onerror) {
        onload = onload || function () {
        };
        onerror = onerror || function () {
        };
        var indexedDB = FS.indexedDB();
        try {
            var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
            return onerror(e);
        }
        openRequest.onupgradeneeded = onerror;
        openRequest.onsuccess = function () {
            var db = openRequest.result;
            try {
                var transaction = db.transaction([FS.DB_STORE_NAME], "readonly");
            } catch (e$3) {
                onerror(e$3);
                return;
            }
            var files = transaction.objectStore(FS.DB_STORE_NAME);
            var ok = 0, fail = 0, total = paths.length;
            function finish() {
                if (fail == 0) {
                    onload();
                } else {
                    onerror();
                }
            }
            paths.forEach(function (path) {
                var getRequest = files.get(path);
                getRequest.onsuccess = function () {
                    if (FS.analyzePath(path).exists) {
                        FS.unlink(path);
                    }
                    FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
                    ok++;
                    if (ok + fail == total) {
                        finish();
                    }
                };
                getRequest.onerror = function () {
                    fail++;
                    if (ok + fail == total) {
                        finish();
                    }
                };
            });
            transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
    }, absolutePath: function () {
        abort("FS.absolutePath has been removed; use PATH_FS.resolve instead");
    }, createFolder: function () {
        abort("FS.createFolder has been removed; use FS.mkdir instead");
    }, createLink: function () {
        abort("FS.createLink has been removed; use FS.symlink instead");
    }, joinPath: function () {
        abort("FS.joinPath has been removed; use PATH.join instead");
    }, mmapAlloc: function () {
        abort("FS.mmapAlloc has been replaced by the top level function mmapAlloc");
    }, standardizePath: function () {
        abort("FS.standardizePath has been removed; use PATH.normalize instead");
    }
};
var SYSCALLS = {
    DEFAULT_POLLMASK: 5, calculateAt: function (dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
            return path;
        }
        var dir;
        if (dirfd === -100) {
            dir = FS.cwd();
        } else {
            var dirstream = FS.getStream(dirfd);
            if (!dirstream) {
                throw new FS.ErrnoError(8);
            }
            dir = dirstream.path;
        }
        if (path.length == 0) {
            if (!allowEmpty) {
                throw new FS.ErrnoError(44);
            }
            return dir;
        }
        return PATH.join2(dir, path);
    }, doStat: function (func, path, buf) {
        try {
            var stat = func(path);
        } catch (e) {
            if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
                return -54;
            }
            throw e;
        }
        HEAP32[buf >> 2] = stat.dev;
        HEAP32[buf + 8 >> 2] = stat.ino;
        HEAP32[buf + 12 >> 2] = stat.mode;
        HEAP32[buf + 16 >> 2] = stat.nlink;
        HEAP32[buf + 20 >> 2] = stat.uid;
        HEAP32[buf + 24 >> 2] = stat.gid;
        HEAP32[buf + 28 >> 2] = stat.rdev;
        tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
        HEAP32[buf + 48 >> 2] = 4096;
        HEAP32[buf + 52 >> 2] = stat.blocks;
        tempI64 = [Math.floor(stat.atime.getTime() / 1000) >>> 0, (tempDouble = Math.floor(stat.atime.getTime() / 1000), +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[buf + 56 >> 2] = tempI64[0], HEAP32[buf + 60 >> 2] = tempI64[1];
        HEAP32[buf + 64 >> 2] = 0;
        tempI64 = [Math.floor(stat.mtime.getTime() / 1000) >>> 0, (tempDouble = Math.floor(stat.mtime.getTime() / 1000), +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[buf + 72 >> 2] = tempI64[0], HEAP32[buf + 76 >> 2] = tempI64[1];
        HEAP32[buf + 80 >> 2] = 0;
        tempI64 = [Math.floor(stat.ctime.getTime() / 1000) >>> 0, (tempDouble = Math.floor(stat.ctime.getTime() / 1000), +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[buf + 88 >> 2] = tempI64[0], HEAP32[buf + 92 >> 2] = tempI64[1];
        HEAP32[buf + 96 >> 2] = 0;
        tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[buf + 104 >> 2] = tempI64[0], HEAP32[buf + 108 >> 2] = tempI64[1];
        return 0;
    }, doMsync: function (addr, stream, len, flags, offset) {
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
    }, varargs: undefined, get: function () {
        assert(SYSCALLS.varargs != undefined);
        SYSCALLS.varargs += 4;
        var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
        return ret;
    }, getStr: function (ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
    }, getStreamFromFD: function (fd) {
        var stream = FS.getStream(fd);
        if (!stream) {
            throw new FS.ErrnoError(8);
        }
        return stream;
    }
};
function ___syscall_fcntl64(fd, cmd, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
            case 0:
                {
                    var arg = SYSCALLS.get();
                    if (arg < 0) {
                        return -28;
                    }
                    var newStream;
                    newStream = FS.createStream(stream, arg);
                    return newStream.fd;
                }
            case 1:
            case 2:
                return 0;
            case 3:
                return stream.flags;
            case 4:
                {
                    var arg = SYSCALLS.get();
                    stream.flags |= arg;
                    return 0;
                }
            case 5:
                {
                    var arg = SYSCALLS.get();
                    var offset = 0;
                    HEAP16[arg + offset >> 1] = 2;
                    return 0;
                }
            case 6:
            case 7:
                return 0;
            case 16:
            case 8:
                return -28;
            case 9:
                setErrNo(28);
                return -1;
            default:
                {
                    return -28;
                }
        }
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) {
            throw e;
        }
        return -e.errno;
    }
}
function ___syscall_ioctl(fd, op, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (op) {
            case 21509:
            case 21505:
                {
                    if (!stream.tty) {
                        return -59;
                    }
                    return 0;
                }
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508:
                {
                    if (!stream.tty) {
                        return -59;
                    }
                    return 0;
                }
            case 21519:
                {
                    if (!stream.tty) {
                        return -59;
                    }
                    var argp = SYSCALLS.get();
                    HEAP32[argp >> 2] = 0;
                    return 0;
                }
            case 21520:
                {
                    if (!stream.tty) {
                        return -59;
                    }
                    return -28;
                }
            case 21531:
                {
                    var argp = SYSCALLS.get();
                    return FS.ioctl(stream, op, argp);
                }
            case 21523:
                {
                    if (!stream.tty) {
                        return -59;
                    }
                    return 0;
                }
            case 21524:
                {
                    if (!stream.tty) {
                        return -59;
                    }
                    return 0;
                }
            default:
                return -28;
        }
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) {
            throw e;
        }
        return -e.errno;
    }
}
function ___syscall_openat(dirfd, path, flags, varargs) {
    SYSCALLS.varargs = varargs;
    try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        var mode = varargs ? SYSCALLS.get() : 0;
        return FS.open(path, flags, mode).fd;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) {
            throw e;
        }
        return -e.errno;
    }
}
function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {
}
function getShiftFromSize(size) {
    switch (size) {
        case 1:
            return 0;
        case 2:
            return 1;
        case 4:
            return 2;
        case 8:
            return 3;
        default:
            throw new TypeError("Unknown type size: " + size);
    }
}
function embind_init_charCodes() {
    var codes = new Array(256);
    for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i);
    }
    embind_charCodes = codes;
}
var embind_charCodes = undefined;
function readLatin1String(ptr) {
    var ret = "";
    var c = ptr;
    while (HEAPU8[c]) {
        ret += embind_charCodes[HEAPU8[c++]];
    }
    return ret;
}
var awaitingDependencies = {};
var registeredTypes = {};
var typeDependencies = {};
var char_0 = 48;
var char_9 = 57;
function makeLegalFunctionName(name) {
    if (undefined === name) {
        return "_unknown";
    }
    name = name.replace(/[^a-zA-Z0-9_]/g, "$");
    var f = name.charCodeAt(0);
    if (f >= char_0 && f <= char_9) {
        return "_" + name;
    }
    return name;
}
function createNamedFunction(name, body) {
    name = makeLegalFunctionName(name);
    return (new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n"))(body);
}
function extendError(baseErrorType, errorName) {
    var errorClass = createNamedFunction(errorName, function (message) {
        this.name = errorName;
        this.message = message;
        var stack = (new Error(message)).stack;
        if (stack !== undefined) {
            this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "");
        }
    });
    errorClass.prototype = Object.create(baseErrorType.prototype);
    errorClass.prototype.constructor = errorClass;
    errorClass.prototype.toString = function () {
        if (this.message === undefined) {
            return this.name;
        } else {
            return this.name + ": " + this.message;
        }
    };
    return errorClass;
}
var BindingError = undefined;
function throwBindingError(message) {
    throw new BindingError(message);
}
var InternalError = undefined;
function throwInternalError(message) {
    throw new InternalError(message);
}
function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
    myTypes.forEach(function (type) {
        typeDependencies[type] = dependentTypes;
    });
    function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
            throwInternalError("Mismatched type converter count");
        }
        for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
        }
    }
    var typeConverters = new Array(dependentTypes.length);
    var unregisteredTypes = [];
    var registered = 0;
    dependentTypes.forEach(function (dt, i) {
        if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
        } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(function () {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                    onComplete(typeConverters);
                }
            });
        }
    });
    if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
    }
}
function registerType(rawType, registeredInstance, options) {
    options = options === void 0 ? {} : options;
    if (!("argPackAdvance" in registeredInstance)) {
        throw new TypeError("registerType registeredInstance requires argPackAdvance");
    }
    var name = registeredInstance.name;
    if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
    }
    if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
            return;
        } else {
            throwBindingError("Cannot register type '" + name + "' twice");
        }
    }
    registeredTypes[rawType] = registeredInstance;
    delete typeDependencies[rawType];
    if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function (cb) {
            return cb();
        });
    }
}
function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);
    registerType(rawType, {
        name: name, "fromWireType": function (wt) {
            return !!wt;
        }, "toWireType": function (destructors, o) {
            return o ? trueValue : falseValue;
        }, "argPackAdvance": 8, "readValueFromPointer": function (pointer) {
            var heap;
            if (size === 1) {
                heap = HEAP8;
            } else if (size === 2) {
                heap = HEAP16;
            } else if (size === 4) {
                heap = HEAP32;
            } else {
                throw new TypeError("Unknown boolean type size: " + name);
            }
            return this["fromWireType"](heap[pointer >> shift]);
        }, destructorFunction: null,
    });
}
var emval_free_list = [];
var emval_handle_array = [{}, { value: undefined }, { value: null }, { value: true }, { value: false }];
function __emval_decref(handle) {
    if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
        emval_handle_array[handle] = undefined;
        emval_free_list.push(handle);
    }
}
function count_emval_handles() {
    var count = 0;
    for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            ++count;
        }
    }
    return count;
}
function get_first_emval() {
    for (var i = 5; i < emval_handle_array.length; ++i) {
        if (emval_handle_array[i] !== undefined) {
            return emval_handle_array[i];
        }
    }
    return null;
}
function init_emval() {
    Module["count_emval_handles"] = count_emval_handles;
    Module["get_first_emval"] = get_first_emval;
}
var Emval = {
    toValue: function (handle) {
        if (!handle) {
            throwBindingError("Cannot use deleted val. handle = " + handle);
        }
        return emval_handle_array[handle].value;
    }, toHandle: function (value) {
        switch (value) {
            case undefined:
                return 1;
            case null:
                return 2;
            case true:
                return 3;
            case false:
                return 4;
            default:
                {
                    var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
                    emval_handle_array[handle] = { refcount: 1, value: value };
                    return handle;
                }
        }
    }
};
function simpleReadValueFromPointer(pointer) {
    return this["fromWireType"](HEAP32[pointer >> 2]);
}
function __embind_register_emval(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name, "fromWireType": function (handle) {
            var rv = Emval.toValue(handle);
            __emval_decref(handle);
            return rv;
        }, "toWireType": function (destructors, value) {
            return Emval.toHandle(value);
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null,
    });
}
function embindRepr(v) {
    if (v === null) {
        return "null";
    }
    var t = typeof v;
    if (t === "object" || t === "array" || t === "function") {
        return v.toString();
    } else {
        return "" + v;
    }
}
function floatReadValueFromPointer(name, shift) {
    switch (shift) {
        case 2:
            return function (pointer) {
                return this["fromWireType"](HEAPF32[pointer >> 2]);
            };
        case 3:
            return function (pointer) {
                return this["fromWireType"](HEAPF64[pointer >> 3]);
            };
        default:
            throw new TypeError("Unknown float type: " + name);
    }
}
function __embind_register_float(rawType, name, size) {
    var shift = getShiftFromSize(size);
    name = readLatin1String(name);
    registerType(rawType, {
        name: name, "fromWireType": function (value) {
            return value;
        }, "toWireType": function (destructors, value) {
            if (typeof value != "number" && typeof value != "boolean") {
                throw new TypeError('Cannot convert "' + embindRepr(value) + '" to ' + this.name);
            }
            return value;
        }, "argPackAdvance": 8, "readValueFromPointer": floatReadValueFromPointer(name, shift), destructorFunction: null,
    });
}
function new_(constructor, argumentList) {
    if (!(constructor instanceof Function)) {
        throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function");
    }
    var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function () {
    });
    dummy.prototype = constructor.prototype;
    var obj = new dummy();
    var r = constructor.apply(obj, argumentList);
    return r instanceof Object ? r : obj;
}
function runDestructors(destructors) {
    while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
    }
}
function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
    var argCount = argTypes.length;
    if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
    }
    var isClassMethodFunc = argTypes[1] !== null && classType !== null;
    var needsDestructorStack = false;
    for (var i = 1; i < argTypes.length; ++i) {
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
            needsDestructorStack = true;
            break;
        }
    }
    var returns = argTypes[0].name !== "void";
    var argsList = "";
    var argsListWired = "";
    for (var i = 0; i < argCount - 2; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired";
    }
    var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";
    if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
    }
    var dtorStack = needsDestructorStack ? "destructors" : "null";
    var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
    var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
    if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n";
    }
    for (var i = 0; i < argCount - 2; ++i) {
        invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
        args1.push("argType" + i);
        args2.push(argTypes[i + 2]);
    }
    if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
    }
    invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
    if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
    } else {
        for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
            var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
            if (argTypes[i].destructorFunction !== null) {
                invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                args1.push(paramName + "_dtor");
                args2.push(argTypes[i].destructorFunction);
            }
        }
    }
    if (returns) {
        invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n";
    } else {
    }
    invokerFnBody += "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function ensureOverloadTable(proto, methodName, humanName) {
    if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        proto[methodName] = function () {
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
    }
}
function exposePublicSymbol(name, value, numArguments) {
    if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
            throwBindingError("Cannot register public name '" + name + "' twice");
        }
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        Module[name].overloadTable[numArguments] = value;
    } else {
        Module[name] = value;
        if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
        }
    }
}
function heap32VectorToArray(count, firstElement) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array.push(HEAPU32[firstElement + i * 4 >> 2]);
    }
    return array;
}
function replacePublicSymbol(name, value, numArguments) {
    if (!Module.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol");
    }
    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
    } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
    }
}
function dynCallLegacy(sig, ptr, args) {
    assert("dynCall_" + sig in Module, "bad function pointer type - no table for sig '" + sig + "'");
    if (args && args.length) {
        assert(args.length === sig.substring(1).replace(/j/g, "--").length);
    } else {
        assert(sig.length == 1);
    }
    var f = Module["dynCall_" + sig];
    return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr);
}
var wasmTableMirror = [];
function getWasmTableEntry(funcPtr) {
    var func = wasmTableMirror[funcPtr];
    if (!func) {
        if (funcPtr >= wasmTableMirror.length) {
            wasmTableMirror.length = funcPtr + 1;
        }
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
    }
    assert(wasmTable.get(funcPtr) == func, "JavaScript-side Wasm function table mirror is out of date!");
    return func;
}
function dynCall(sig, ptr, args) {
    if (sig.includes("j")) {
        return dynCallLegacy(sig, ptr, args);
    }
    assert(getWasmTableEntry(ptr), "missing table entry in dynCall: " + ptr);
    var rtn = getWasmTableEntry(ptr).apply(null, args);
    return rtn;
}
function getDynCaller(sig, ptr) {
    assert(sig.includes("j") || sig.includes("p"), "getDynCaller should only be called with i64 sigs");
    var argCache = [];
    return function () {
        argCache.length = 0;
        Object.assign(argCache, arguments);
        return dynCall(sig, ptr, argCache);
    };
}
function embind__requireFunction(signature, rawFunction) {
    signature = readLatin1String(signature);
    function makeDynCaller() {
        if (signature.includes("j")) {
            return getDynCaller(signature, rawFunction);
        }
        return getWasmTableEntry(rawFunction);
    }
    var fp = makeDynCaller();
    if (typeof fp != "function") {
        throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
    }
    return fp;
}
var UnboundTypeError = undefined;
function getTypeName(type) {
    var ptr = ___getTypeName(type);
    var rv = readLatin1String(ptr);
    _free(ptr);
    return rv;
}
function throwUnboundTypeError(message, types) {
    var unboundTypes = [];
    var seen = {};
    function visit(type) {
        if (seen[type]) {
            return;
        }
        if (registeredTypes[type]) {
            return;
        }
        if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
        }
        unboundTypes.push(type);
        seen[type] = true;
    }
    types.forEach(visit);
    throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]));
}
function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
    var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    name = readLatin1String(name);
    rawInvoker = embind__requireFunction(signature, rawInvoker);
    exposePublicSymbol(name, function () {
        throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes);
    }, argCount - 1);
    whenDependentTypesAreResolved([], argTypes, function (argTypes) {
        var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
        return [];
    });
}
function integerReadValueFromPointer(name, shift, signed) {
    switch (shift) {
        case 0:
            return signed ? function readS8FromPointer(pointer) {
                return HEAP8[pointer];
            } : function readU8FromPointer(pointer) {
                return HEAPU8[pointer];
            };
        case 1:
            return signed ? function readS16FromPointer(pointer) {
                return HEAP16[pointer >> 1];
            } : function readU16FromPointer(pointer) {
                return HEAPU16[pointer >> 1];
            };
        case 2:
            return signed ? function readS32FromPointer(pointer) {
                return HEAP32[pointer >> 2];
            } : function readU32FromPointer(pointer) {
                return HEAPU32[pointer >> 2];
            };
        default:
            throw new TypeError("Unknown integer type: " + name);
    }
}
function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
    name = readLatin1String(name);
    if (maxRange === -1) {
        maxRange = 4294967295;
    }
    var shift = getShiftFromSize(size);
    var fromWireType = function (value) {
        return value;
    };
    if (minRange === 0) {
        var bitshift = 32 - 8 * size;
        fromWireType = function (value) {
            return value << bitshift >>> bitshift;
        };
    }
    var isUnsignedType = name.includes("unsigned");
    var checkAssertions = function (value, toTypeName) {
        if (typeof value != "number" && typeof value != "boolean") {
            throw new TypeError('Cannot convert "' + embindRepr(value) + '" to ' + toTypeName);
        }
        if (value < minRange || value > maxRange) {
            throw new TypeError('Passing a number "' + embindRepr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!");
        }
    };
    var toWireType;
    if (isUnsignedType) {
        toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            return value >>> 0;
        };
    } else {
        toWireType = function (destructors, value) {
            checkAssertions(value, this.name);
            return value;
        };
    }
    registerType(primitiveType, { name: name, "fromWireType": fromWireType, "toWireType": toWireType, "argPackAdvance": 8, "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0), destructorFunction: null, });
}
function __embind_register_memory_view(rawType, dataTypeIndex, name) {
    var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,];
    var TA = typeMapping[dataTypeIndex];
    function decodeMemoryView(handle) {
        handle = handle >> 2;
        var heap = HEAPU32;
        var size = heap[handle];
        var data = heap[handle + 1];
        return new TA(buffer, data, size);
    }
    name = readLatin1String(name);
    registerType(rawType, { name: name, "fromWireType": decodeMemoryView, "argPackAdvance": 8, "readValueFromPointer": decodeMemoryView, }, { ignoreDuplicateRegistrations: true, });
}
function __embind_register_std_string(rawType, name) {
    name = readLatin1String(name);
    var stdStringIsUTF8 = name === "std::string";
    registerType(rawType, {
        name: name, "fromWireType": function (value) {
            var length = HEAPU32[value >> 2];
            var payload = value + 4;
            var str;
            if (stdStringIsUTF8) {
                var decodeStartPtr = payload;
                for (var i = 0; i <= length; ++i) {
                    var currentBytePtr = payload + i;
                    if (i == length || HEAPU8[currentBytePtr] == 0) {
                        var maxRead = currentBytePtr - decodeStartPtr;
                        var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                        if (str === undefined) {
                            str = stringSegment;
                        } else {
                            str += String.fromCharCode(0);
                            str += stringSegment;
                        }
                        decodeStartPtr = currentBytePtr + 1;
                    }
                }
            } else {
                var a = new Array(length);
                for (var i = 0; i < length; ++i) {
                    a[i] = String.fromCharCode(HEAPU8[payload + i]);
                }
                str = a.join("");
            }
            _free(value);
            return str;
        }, "toWireType": function (destructors, value) {
            if (value instanceof ArrayBuffer) {
                value = new Uint8Array(value);
            }
            var length;
            var valueIsOfTypeString = typeof value == "string";
            if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                throwBindingError("Cannot pass non-string to std::string");
            }
            if (stdStringIsUTF8 && valueIsOfTypeString) {
                length = lengthBytesUTF8(value);
            } else {
                length = value.length;
            }
            var base = _malloc(4 + length + 1);
            var ptr = base + 4;
            HEAPU32[base >> 2] = length;
            if (stdStringIsUTF8 && valueIsOfTypeString) {
                stringToUTF8(value, ptr, length + 1);
            } else {
                if (valueIsOfTypeString) {
                    for (var i = 0; i < length; ++i) {
                        var charCode = value.charCodeAt(i);
                        if (charCode > 255) {
                            _free(ptr);
                            throwBindingError("String has UTF-16 code units that do not fit in 8 bits");
                        }
                        HEAPU8[ptr + i] = charCode;
                    }
                } else {
                    for (var i = 0; i < length; ++i) {
                        HEAPU8[ptr + i] = value[i];
                    }
                }
            }
            if (destructors !== null) {
                destructors.push(_free, base);
            }
            return base;
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function (ptr) {
            _free(ptr);
        },
    });
}
var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : undefined;
function UTF16ToString(ptr, maxBytesToRead) {
    assert(ptr % 2 == 0, "Pointer passed to UTF16ToString must be aligned to two bytes!");
    var endPtr = ptr;
    var idx = endPtr >> 1;
    var maxIdx = idx + maxBytesToRead / 2;
    while (!(idx >= maxIdx) && HEAPU16[idx]) {
        ++idx;
    }
    endPtr = idx << 1;
    if (endPtr - ptr > 32 && UTF16Decoder) {
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
    } else {
        var str = "";
        for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
            var codeUnit = HEAP16[ptr + i * 2 >> 1];
            if (codeUnit == 0) {
                break;
            }
            str += String.fromCharCode(codeUnit);
        }
        return str;
    }
}
function stringToUTF16(str, outPtr, maxBytesToWrite) {
    assert(outPtr % 2 == 0, "Pointer passed to stringToUTF16 must be aligned to two bytes!");
    assert(typeof maxBytesToWrite == "number", "stringToUTF16(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
    if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 2147483647;
    }
    if (maxBytesToWrite < 2) {
        return 0;
    }
    maxBytesToWrite -= 2;
    var startPtr = outPtr;
    var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
    for (var i = 0; i < numCharsToWrite; ++i) {
        var codeUnit = str.charCodeAt(i);
        HEAP16[outPtr >> 1] = codeUnit;
        outPtr += 2;
    }
    HEAP16[outPtr >> 1] = 0;
    return outPtr - startPtr;
}
function lengthBytesUTF16(str) {
    return str.length * 2;
}
function UTF32ToString(ptr, maxBytesToRead) {
    assert(ptr % 4 == 0, "Pointer passed to UTF32ToString must be aligned to four bytes!");
    var i = 0;
    var str = "";
    while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[ptr + i * 4 >> 2];
        if (utf32 == 0) {
            break;
        }
        ++i;
        if (utf32 >= 65536) {
            var ch = utf32 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        } else {
            str += String.fromCharCode(utf32);
        }
    }
    return str;
}
function stringToUTF32(str, outPtr, maxBytesToWrite) {
    assert(outPtr % 4 == 0, "Pointer passed to stringToUTF32 must be aligned to four bytes!");
    assert(typeof maxBytesToWrite == "number", "stringToUTF32(str, outPtr, maxBytesToWrite) is missing the third parameter that specifies the length of the output buffer!");
    if (maxBytesToWrite === undefined) {
        maxBytesToWrite = 2147483647;
    }
    if (maxBytesToWrite < 4) {
        return 0;
    }
    var startPtr = outPtr;
    var endPtr = startPtr + maxBytesToWrite - 4;
    for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
            var trailSurrogate = str.charCodeAt(++i);
            codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr) {
            break;
        }
    }
    HEAP32[outPtr >> 2] = 0;
    return outPtr - startPtr;
}
function lengthBytesUTF32(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
            ++i;
        }
        len += 4;
    }
    return len;
}
function __embind_register_std_wstring(rawType, charSize, name) {
    name = readLatin1String(name);
    var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
    if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        getHeap = function () {
            return HEAPU16;
        };
        shift = 1;
    } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        getHeap = function () {
            return HEAPU32;
        };
        shift = 2;
    }
    registerType(rawType, {
        name: name, "fromWireType": function (value) {
            var length = HEAPU32[value >> 2];
            var HEAP = getHeap();
            var str;
            var decodeStartPtr = value + 4;
            for (var i = 0; i <= length; ++i) {
                var currentBytePtr = value + 4 + i * charSize;
                if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                    var maxReadBytes = currentBytePtr - decodeStartPtr;
                    var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                    if (str === undefined) {
                        str = stringSegment;
                    } else {
                        str += String.fromCharCode(0);
                        str += stringSegment;
                    }
                    decodeStartPtr = currentBytePtr + charSize;
                }
            }
            _free(value);
            return str;
        }, "toWireType": function (destructors, value) {
            if (!(typeof value == "string")) {
                throwBindingError("Cannot pass non-string to C++ string type " + name);
            }
            var length = lengthBytesUTF(value);
            var ptr = _malloc(4 + length + charSize);
            HEAPU32[ptr >> 2] = length >> shift;
            encodeString(value, ptr + 4, length + charSize);
            if (destructors !== null) {
                destructors.push(_free, ptr);
            }
            return ptr;
        }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: function (ptr) {
            _free(ptr);
        },
    });
}
function __embind_register_void(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        isVoid: true, name: name, "argPackAdvance": 0, "fromWireType": function () {
            return undefined;
        }, "toWireType": function (destructors, o) {
            return undefined;
        },
    });
}
function __emscripten_date_now() {
    return Date.now();
}
function __emscripten_fetch_free(id) {
    delete Fetch.xhrs[id - 1];
}
function __emscripten_fs_load_embedded_files(ptr) {
    do {
        var name_addr = HEAPU32[ptr >> 2];
        ptr += 4;
        var len = HEAPU32[ptr >> 2];
        ptr += 4;
        var content = HEAPU32[ptr >> 2];
        ptr += 4;
        var name = UTF8ToString(name_addr);
        FS.createPath("/", PATH.dirname(name), true, true);
        FS.createDataFile(name, null, HEAP8.subarray(content, content + len), true, true, true);
    } while (HEAPU32[ptr >> 2]);
}
function _abort() {
    abort("native code called abort()");
}
var readAsmConstArgsArray = [];
function readAsmConstArgs(sigPtr, buf) {
    assert(Array.isArray(readAsmConstArgsArray));
    assert(buf % 16 == 0);
    readAsmConstArgsArray.length = 0;
    var ch;
    buf >>= 2;
    while (ch = HEAPU8[sigPtr++]) {
        var chr = String.fromCharCode(ch);
        var validChars = ["d", "f", "i"];
        assert(validChars.includes(chr), "Invalid character " + ch + '("' + chr + '") in readAsmConstArgs! Use only [' + validChars + '], and do not specify "v" for void return argument.');
        buf += ch != 105 & buf;
        readAsmConstArgsArray.push(ch == 105 ? HEAP32[buf] : HEAPF64[buf++ >> 1]);
        ++buf;
    }
    return readAsmConstArgsArray;
}
function _emscripten_asm_const_int(code, sigPtr, argbuf) {
    var args = readAsmConstArgs(sigPtr, argbuf);
    if (devSettings.logASMCalls) {
        if (asmCommonTable[code]) {
            asmCommonTable[code](args);
        }
        else {
            console.log(code, args);
        }
    }
    if (!ASM_CONSTS.hasOwnProperty(code)) {
        abort("No EM_ASM constant found at address " + code);
    }
    return ASM_CONSTS[code].apply(null, args);
}
var _emscripten_asm_const_double = _emscripten_asm_const_int;
function _emscripten_is_main_browser_thread() {
    return !ENVIRONMENT_IS_WORKER;
}
var _emscripten_memcpy_big = Uint8Array.prototype.copyWithin ? function (dest, src, num) {
    return HEAPU8.copyWithin(dest, src, src + num);
} : function (dest, src, num) {
    return HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
};
function getHeapMax() {
    return 2147483648;
}
function emscripten_realloc_buffer(size) {
    try {
        wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1;
    } catch (e) {
        err("emscripten_realloc_buffer: Attempted to grow heap from " + buffer.byteLength + " bytes to " + size + " bytes, but got error: " + e);
    }
}
function _emscripten_resize_heap(requestedSize) {
    var oldSize = HEAPU8.length;
    requestedSize = requestedSize >>> 0;
    assert(requestedSize > oldSize);
    var maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
        err("Cannot enlarge memory, asked to go up to " + requestedSize + " bytes, but the limit is " + maxHeapSize + " bytes!");
        return false;
    }
    var alignUp = function (x, multiple) {
        return x + (multiple - x % multiple) % multiple;
    };
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = emscripten_realloc_buffer(newSize);
        if (replacement) {
            return true;
        }
    }
    err("Failed to grow the heap from " + oldSize + " bytes to " + newSize + " bytes, not enough memory!");
    return false;
}
function _emscripten_run_script_int(ptr) {
    return eval(UTF8ToString(ptr)) | 0;
}
function callUserCallback(func) {
    if (ABORT) {
        err("user callback triggered after runtime exited or application aborted.  Ignoring.");
        return;
    }
    try {
        func();
    } catch (e) {
        handleException(e);
    }
}
function safeSetTimeout(func, timeout) {
    return setTimeout(function () {
        callUserCallback(func);
    }, timeout);
}
var Browser = {
    mainLoop: {
        running: false, scheduler: null, method: "", currentlyRunningMainloop: 0, func: null, arg: 0, timingMode: 0, timingValue: 0, currentFrameNumber: 0, queue: [], pause: function () {
            Browser.mainLoop.scheduler = null;
            Browser.mainLoop.currentlyRunningMainloop++;
        }, resume: function () {
            Browser.mainLoop.currentlyRunningMainloop++;
            var timingMode = Browser.mainLoop.timingMode;
            var timingValue = Browser.mainLoop.timingValue;
            var func = Browser.mainLoop.func;
            Browser.mainLoop.func = null;
            setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
            _emscripten_set_main_loop_timing(timingMode, timingValue);
            Browser.mainLoop.scheduler();
        }, updateStatus: function () {
            if (Module["setStatus"]) {
                var message = Module["statusMessage"] || "Please wait...";
                var remaining = Browser.mainLoop.remainingBlockers;
                var expected = Browser.mainLoop.expectedBlockers;
                if (remaining) {
                    if (remaining < expected) {
                        Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
                    } else {
                        Module["setStatus"](message);
                    }
                } else {
                    Module["setStatus"]("");
                }
            }
        }, runIter: function (func) {
            if (ABORT) {
                return;
            }
            if (Module["preMainLoop"]) {
                var preRet = Module["preMainLoop"]();
                if (preRet === false) {
                    return;
                }
            }
            callUserCallback(func);
            if (Module["postMainLoop"]) {
                Module["postMainLoop"]();
            }
        }
    }, isFullscreen: false, pointerLock: false, moduleContextCreatedCallbacks: [], workers: [], init: function () {
        if (!Module["preloadPlugins"]) {
            Module["preloadPlugins"] = [];
        }
        if (Browser.initted) {
            return;
        }
        Browser.initted = true;
        try {
            new Blob();
            Browser.hasBlobConstructor = true;
        } catch (e) {
            Browser.hasBlobConstructor = false;
            err("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? err("warning: no BlobBuilder") : null;
        Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject == "undefined") {
            err("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
            Module.noImageDecoding = true;
        }
        var imagePlugin = {};
        imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
            return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
            var b = null;
            if (Browser.hasBlobConstructor) {
                try {
                    b = new Blob([byteArray], { type: Browser.getMimetype(name) });
                    if (b.size !== byteArray.length) {
                        b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
                    }
                } catch (e$4) {
                    warnOnce("Blob constructor present but fails: " + e$4 + "; falling back to blob builder");
                }
            }
            if (!b) {
                var bb = new Browser.BlobBuilder();
                bb.append((new Uint8Array(byteArray)).buffer);
                b = bb.getBlob();
            }
            var url = Browser.URLObject.createObjectURL(b);
            assert(typeof url == "string", "createObjectURL must return a url as a string");
            var img = new Image();
            img.onload = function () {
                assert(img.complete, "Image " + name + " could not be decoded");
                var canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                preloadedImages[name] = canvas;
                Browser.URLObject.revokeObjectURL(url);
                if (onload) {
                    onload(byteArray);
                }
            };
            img.onerror = function (event) {
                out("Image " + url + " could not be decoded");
                if (onerror) {
                    onerror();
                }
            };
            img.src = url;
        };
        Module["preloadPlugins"].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
            return !Module.noAudioDecoding && name.substr(-4) in { ".ogg": 1, ".wav": 1, ".mp3": 1 };
        };
        audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
            var done = false;
            function finish(audio) {
                if (done) {
                    return;
                }
                done = true;
                preloadedAudios[name] = audio;
                if (onload) {
                    onload(byteArray);
                }
            }
            function fail() {
                if (done) {
                    return;
                }
                done = true;
                preloadedAudios[name] = new Audio();
                if (onerror) {
                    onerror();
                }
            }
            if (Browser.hasBlobConstructor) {
                try {
                    var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
                } catch (e$5) {
                    return fail();
                }
                var url = Browser.URLObject.createObjectURL(b);
                assert(typeof url == "string", "createObjectURL must return a url as a string");
                var audio = new Audio();
                audio.addEventListener("canplaythrough", function () {
                    return finish(audio);
                }, false);
                audio.onerror = function audio_onerror(event) {
                    if (done) {
                        return;
                    }
                    err("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
                    function encode64(data) {
                        var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                        var PAD = "=";
                        var ret = "";
                        var leftchar = 0;
                        var leftbits = 0;
                        for (var i = 0; i < data.length; i++) {
                            leftchar = leftchar << 8 | data[i];
                            leftbits += 8;
                            while (leftbits >= 6) {
                                var curr = leftchar >> leftbits - 6 & 63;
                                leftbits -= 6;
                                ret += BASE[curr];
                            }
                        }
                        if (leftbits == 2) {
                            ret += BASE[(leftchar & 3) << 4];
                            ret += PAD + PAD;
                        } else if (leftbits == 4) {
                            ret += BASE[(leftchar & 15) << 2];
                            ret += PAD;
                        }
                        return ret;
                    }
                    audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
                    finish(audio);
                };
                audio.src = url;
                safeSetTimeout(function () {
                    finish(audio);
                }, 10000);
            } else {
                return fail();
            }
        };
        Module["preloadPlugins"].push(audioPlugin);
        function pointerLockChange() {
            Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
        }
        var canvas = Module["canvas"];
        if (canvas) {
            canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || function () {
            };
            canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || function () {
            };
            canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
            document.addEventListener("pointerlockchange", pointerLockChange, false);
            document.addEventListener("mozpointerlockchange", pointerLockChange, false);
            document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
            document.addEventListener("mspointerlockchange", pointerLockChange, false);
            if (Module["elementPointerLock"]) {
                canvas.addEventListener("click", function (ev) {
                    if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
                        Module["canvas"].requestPointerLock();
                        ev.preventDefault();
                    }
                }, false);
            }
        }
    }, handledByPreloadPlugin: function (byteArray, fullname, finish, onerror) {
        Browser.init();
        var handled = false;
        Module["preloadPlugins"].forEach(function (plugin) {
            if (handled) {
                return;
            }
            if (plugin["canHandle"](fullname)) {
                plugin["handle"](byteArray, fullname, finish, onerror);
                handled = true;
            }
        });
        return handled;
    }, createContext: function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module.ctx && canvas == Module.canvas) {
            return Module.ctx;
        }
        var ctx;
        var contextHandle;
        if (useWebGL) {
            var contextAttributes = { antialias: false, alpha: false, majorVersion: 1, };
            if (webGLContextAttributes) {
                for (var attribute in webGLContextAttributes) {
                    contextAttributes[attribute] = webGLContextAttributes[attribute];
                }
            }
            if (typeof GL != "undefined") {
                contextHandle = GL.createContext(canvas, contextAttributes);
                if (contextHandle) {
                    ctx = GL.getContext(contextHandle).GLctx;
                }
            }
        } else {
            ctx = canvas.getContext("2d");
        }
        if (!ctx) {
            return null;
        }
        if (setInModule) {
            if (!useWebGL) {
                assert(typeof GLctx == "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
            }
            Module.ctx = ctx;
            if (useWebGL) {
                GL.makeContextCurrent(contextHandle);
            }
            Module.useWebGL = useWebGL;
            Browser.moduleContextCreatedCallbacks.forEach(function (callback) {
                callback();
            });
            Browser.init();
        }
        return ctx;
    }, destroyContext: function (canvas, useWebGL, setInModule) {
    }, fullscreenHandlersInstalled: false, lockPointer: undefined, resizeCanvas: undefined, requestFullscreen: function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer == "undefined") {
            Browser.lockPointer = true;
        }
        if (typeof Browser.resizeCanvas == "undefined") {
            Browser.resizeCanvas = false;
        }
        var canvas = Module["canvas"];
        function fullscreenChange() {
            Browser.isFullscreen = false;
            var canvasContainer = canvas.parentNode;
            if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
                canvas.exitFullscreen = Browser.exitFullscreen;
                if (Browser.lockPointer) {
                    canvas.requestPointerLock();
                }
                Browser.isFullscreen = true;
                if (Browser.resizeCanvas) {
                    Browser.setFullscreenCanvasSize();
                } else {
                    Browser.updateCanvasDimensions(canvas);
                }
            } else {
                canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
                canvasContainer.parentNode.removeChild(canvasContainer);
                if (Browser.resizeCanvas) {
                    Browser.setWindowedCanvasSize();
                } else {
                    Browser.updateCanvasDimensions(canvas);
                }
            }
            if (Module["onFullScreen"]) {
                Module["onFullScreen"](Browser.isFullscreen);
            }
            if (Module["onFullscreen"]) {
                Module["onFullscreen"](Browser.isFullscreen);
            }
        }
        if (!Browser.fullscreenHandlersInstalled) {
            Browser.fullscreenHandlersInstalled = true;
            document.addEventListener("fullscreenchange", fullscreenChange, false);
            document.addEventListener("mozfullscreenchange", fullscreenChange, false);
            document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
            document.addEventListener("MSFullscreenChange", fullscreenChange, false);
        }
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? function () {
            return canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
        } : null) || (canvasContainer["webkitRequestFullScreen"] ? function () {
            return canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
        } : null);
        canvasContainer.requestFullscreen();
    }, requestFullScreen: function () {
        abort("Module.requestFullScreen has been replaced by Module.requestFullscreen (without a capital S)");
    }, exitFullscreen: function () {
        if (!Browser.isFullscreen) {
            return false;
        }
        var CFS = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || function () {
        };
        CFS.apply(document, []);
        return true;
    }, nextRAF: 0, fakeRequestAnimationFrame: function (func) {
        var now = Date.now();
        if (Browser.nextRAF === 0) {
            Browser.nextRAF = now + 1000 / 60;
        } else {
            while (now + 2 >= Browser.nextRAF) {
                Browser.nextRAF += 1000 / 60;
            }
        }
        var delay = Math.max(Browser.nextRAF - now, 0);
        setTimeout(func, delay);
    }, requestAnimationFrame: function (func) {
        if (typeof requestAnimationFrame == "function") {
            requestAnimationFrame(func);
            return;
        }
        var RAF = Browser.fakeRequestAnimationFrame;
        if (typeof window != "undefined") {
            RAF = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || RAF;
        }
        RAF(func);
    }, safeSetTimeout: function (func) {
        return safeSetTimeout(func);
    }, safeRequestAnimationFrame: function (func) {
        return Browser.requestAnimationFrame(function () {
            callUserCallback(func);
        });
    }, getMimetype: function (name) {
        return { "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "bmp": "image/bmp", "ogg": "audio/ogg", "wav": "audio/wav", "mp3": "audio/mpeg" }[name.substr(name.lastIndexOf(".") + 1)];
    }, getUserMedia: function (func) {
        if (!window.getUserMedia) {
            window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
        }
        window.getUserMedia(func);
    }, getMovementX: function (event) {
        return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
    }, getMovementY: function (event) {
        return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
    }, getMouseWheelDelta: function (event) {
        var delta = 0;
        switch (event.type) {
            case "DOMMouseScroll":
                delta = event.detail / 3;
                break;
            case "mousewheel":
                delta = event.wheelDelta / 120;
                break;
            case "wheel":
                delta = event.deltaY;
                switch (event.deltaMode) {
                    case 0:
                        delta /= 100;
                        break;
                    case 1:
                        delta /= 3;
                        break;
                    case 2:
                        delta *= 80;
                        break;
                    default:
                        throw "unrecognized mouse wheel delta mode: " + event.deltaMode;
                }break;
            default:
                throw "unrecognized mouse wheel event: " + event.type;
        }
        return delta;
    }, mouseX: 0, mouseY: 0, mouseMovementX: 0, mouseMovementY: 0, touches: {}, lastTouches: {}, calculateMouseEvent: function (event) {
        if (Browser.pointerLock) {
            if (event.type != "mousemove" && "mozMovementX" in event) {
                Browser.mouseMovementX = Browser.mouseMovementY = 0;
            } else {
                Browser.mouseMovementX = Browser.getMovementX(event);
                Browser.mouseMovementY = Browser.getMovementY(event);
            }
            if (typeof SDL != "undefined") {
                Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
                Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
            } else {
                Browser.mouseX += Browser.mouseMovementX;
                Browser.mouseY += Browser.mouseMovementY;
            }
        } else {
            var rect = Module["canvas"].getBoundingClientRect();
            var cw = Module["canvas"].width;
            var ch = Module["canvas"].height;
            var scrollX = typeof window.scrollX != "undefined" ? window.scrollX : window.pageXOffset;
            var scrollY = typeof window.scrollY != "undefined" ? window.scrollY : window.pageYOffset;
            assert(typeof scrollX != "undefined" && typeof scrollY != "undefined", "Unable to retrieve scroll position, mouse positions likely broken.");
            if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
                var touch = event.touch;
                if (touch === undefined) {
                    return;
                }
                var adjustedX = touch.pageX - (scrollX + rect.left);
                var adjustedY = touch.pageY - (scrollY + rect.top);
                adjustedX = adjustedX * (cw / rect.width);
                adjustedY = adjustedY * (ch / rect.height);
                var coords = { x: adjustedX, y: adjustedY };
                if (event.type === "touchstart") {
                    Browser.lastTouches[touch.identifier] = coords;
                    Browser.touches[touch.identifier] = coords;
                } else if (event.type === "touchend" || event.type === "touchmove") {
                    var last = Browser.touches[touch.identifier];
                    if (!last) {
                        last = coords;
                    }
                    Browser.lastTouches[touch.identifier] = last;
                    Browser.touches[touch.identifier] = coords;
                }
                return;
            }
            var x = event.pageX - (scrollX + rect.left);
            var y = event.pageY - (scrollY + rect.top);
            x = x * (cw / rect.width);
            y = y * (ch / rect.height);
            Browser.mouseMovementX = x - Browser.mouseX;
            Browser.mouseMovementY = y - Browser.mouseY;
            Browser.mouseX = x;
            Browser.mouseY = y;
        }
    }, resizeListeners: [], updateResizeListeners: function () {
        var canvas = Module["canvas"];
        Browser.resizeListeners.forEach(function (listener) {
            listener(canvas.width, canvas.height);
        });
    }, setCanvasSize: function (width, height, noUpdates) {
        var canvas = Module["canvas"];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) {
            Browser.updateResizeListeners();
        }
    }, windowedWidth: 0, windowedHeight: 0, setFullscreenCanvasSize: function () {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags | 8388608;
            HEAP32[SDL.screen >> 2] = flags;
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners();
    }, setWindowedCanvasSize: function () {
        if (typeof SDL != "undefined") {
            var flags = HEAPU32[SDL.screen >> 2];
            flags = flags & ~8388608;
            HEAP32[SDL.screen >> 2] = flags;
        }
        Browser.updateCanvasDimensions(Module["canvas"]);
        Browser.updateResizeListeners();
    }, updateCanvasDimensions: function (canvas, wNative, hNative) {
        if (wNative && hNative) {
            canvas.widthNative = wNative;
            canvas.heightNative = hNative;
        } else {
            wNative = canvas.widthNative;
            hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
            if (w / h < Module["forcedAspectRatio"]) {
                w = Math.round(h * Module["forcedAspectRatio"]);
            } else {
                h = Math.round(w / Module["forcedAspectRatio"]);
            }
        }
        if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
            var factor = Math.min(screen.width / w, screen.height / h);
            w = Math.round(w * factor);
            h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
            if (canvas.width != w) {
                canvas.width = w;
            }
            if (canvas.height != h) {
                canvas.height = h;
            }
            if (typeof canvas.style != "undefined") {
                canvas.style.removeProperty("width");
                canvas.style.removeProperty("height");
            }
        } else {
            if (canvas.width != wNative) {
                canvas.width = wNative;
            }
            if (canvas.height != hNative) {
                canvas.height = hNative;
            }
            if (typeof canvas.style != "undefined") {
                if (w != wNative || h != hNative) {
                    canvas.style.setProperty("width", w + "px", "important");
                    canvas.style.setProperty("height", h + "px", "important");
                } else {
                    canvas.style.removeProperty("width");
                    canvas.style.removeProperty("height");
                }
            }
        }
    }
};
function _emscripten_set_main_loop_timing(mode, value) {
    Browser.mainLoop.timingMode = mode;
    Browser.mainLoop.timingValue = value;
    if (!Browser.mainLoop.func) {
        err("emscripten_set_main_loop_timing: Cannot set timing mode for main loop since a main loop does not exist! Call emscripten_set_main_loop first to set one up.");
        return 1;
    }
    if (!Browser.mainLoop.running) {
        Browser.mainLoop.running = true;
    }
    if (mode == 0) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
            var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
            setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
        };
        Browser.mainLoop.method = "timeout";
    } else if (mode == 1) {
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
            Browser.requestAnimationFrame(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = "rAF";
    } else if (mode == 2) {
        if (typeof setImmediate == "undefined") {
            var setImmediates = [];
            var emscriptenMainLoopMessageId = "setimmediate";
            var Browser_setImmediate_messageHandler = function (event) {
                if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
                    event.stopPropagation();
                    setImmediates.shift()();
                }
            };
            addEventListener("message", Browser_setImmediate_messageHandler, true);
            setImmediate = function Browser_emulated_setImmediate(func) {
                setImmediates.push(func);
                if (ENVIRONMENT_IS_WORKER) {
                    if (Module["setImmediates"] === undefined) {
                        Module["setImmediates"] = [];
                    }
                    Module["setImmediates"].push(func);
                    postMessage({ target: emscriptenMainLoopMessageId });
                } else {
                    postMessage(emscriptenMainLoopMessageId, "*");
                }
            };
        }
        Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
            setImmediate(Browser.mainLoop.runner);
        };
        Browser.mainLoop.method = "immediate";
    }
    return 0;
}
var _emscripten_get_now;
if (ENVIRONMENT_IS_NODE) {
    _emscripten_get_now = function () {
        var t = process["hrtime"]();
        return t[0] * 1e3 + t[1] / 1e6;
    };
} else if (typeof performance != "undefined" && performance.now) {
    _emscripten_get_now = function () {
        return performance.now();
    };
} else {
    _emscripten_get_now = Date.now;
}
function _proc_exit(code) {
    EXITSTATUS = code;
    if (!keepRuntimeAlive()) {
        if (Module["onExit"]) {
            Module["onExit"](code);
        }
        ABORT = true;
    }
    quit_(code, new ExitStatus(code));
}
function exitJS(status, implicit) {
    EXITSTATUS = status;
    checkUnflushedContent();
    if (keepRuntimeAlive() && !implicit) {
        var msg = "program exited (with status: " + status + "), but EXIT_RUNTIME is not set, so halting execution but not exiting the runtime or preventing further async execution (build with EXIT_RUNTIME=1, if you want a true shutdown)";
        err(msg);
    }
    _proc_exit(status);
}
var _exit = exitJS;
function maybeExit() {
}
function setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) {
    assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
    Browser.mainLoop.func = browserIterationFunc;
    Browser.mainLoop.arg = arg;
    var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
    function checkIsRunning() {
        if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {
            maybeExit();
            return false;
        }
        return true;
    }
    Browser.mainLoop.running = false;
    Browser.mainLoop.runner = function Browser_mainLoop_runner() {
        if (ABORT) {
            return;
        }
        if (Browser.mainLoop.queue.length > 0) {
            var start = Date.now();
            var blocker = Browser.mainLoop.queue.shift();
            blocker.func(blocker.arg);
            if (Browser.mainLoop.remainingBlockers) {
                var remaining = Browser.mainLoop.remainingBlockers;
                var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
                if (blocker.counted) {
                    Browser.mainLoop.remainingBlockers = next;
                } else {
                    next = next + 0.5;
                    Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
                }
            }
            out('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
            Browser.mainLoop.updateStatus();
            if (!checkIsRunning()) {
                return;
            }
            setTimeout(Browser.mainLoop.runner, 0);
            return;
        }
        if (!checkIsRunning()) {
            return;
        }
        Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
        if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
            Browser.mainLoop.scheduler();
            return;
        } else if (Browser.mainLoop.timingMode == 0) {
            Browser.mainLoop.tickStartTime = _emscripten_get_now();
        }
        if (Browser.mainLoop.method === "timeout" && Module.ctx) {
            warnOnce("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
            Browser.mainLoop.method = "";
        }
        Browser.mainLoop.runIter(browserIterationFunc);
        checkStackCookie();
        if (!checkIsRunning()) {
            return;
        }
        if (typeof SDL == "object" && SDL.audio && SDL.audio.queueNewAudioData) {
            SDL.audio.queueNewAudioData();
        }
        Browser.mainLoop.scheduler();
    };
    if (!noSetTiming) {
        if (fps && fps > 0) {
            _emscripten_set_main_loop_timing(0, 1000.0 / fps);
        } else {
            _emscripten_set_main_loop_timing(1, 1);
        }
        Browser.mainLoop.scheduler();
    }
    if (simulateInfiniteLoop) {
        throw "unwind";
    }
}
function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop) {
    var browserIterationFunc = getWasmTableEntry(func);
    setMainLoop(browserIterationFunc, fps, simulateInfiniteLoop);
}
var Fetch = {
    xhrs: [], setu64: function (addr, val) {
        HEAPU32[addr >> 2] = val;
        HEAPU32[addr + 4 >> 2] = val / 4294967296 | 0;
    }, openDatabase: function (dbname, dbversion, onsuccess, onerror) {
        try {
            var openRequest = indexedDB.open(dbname, dbversion);
        } catch (e) {
            return onerror(e);
        }
        openRequest.onupgradeneeded = function (event) {
            var db = event.target.result;
            if (db.objectStoreNames.contains("FILES")) {
                db.deleteObjectStore("FILES");
            }
            db.createObjectStore("FILES");
        };
        openRequest.onsuccess = function (event) {
            return onsuccess(event.target.result);
        };
        openRequest.onerror = function (error) {
            return onerror(error);
        };
    }, staticInit: function () {
        var isMainThread = true;
        var onsuccess = function (db) {
            Fetch.dbInstance = db;
            if (isMainThread) {
                removeRunDependency("library_fetch_init");
            }
        };
        var onerror = function () {
            Fetch.dbInstance = false;
            if (isMainThread) {
                removeRunDependency("library_fetch_init");
            }
        };
        Fetch.openDatabase("emscripten_filesystem", 1, onsuccess, onerror);
        if (typeof ENVIRONMENT_IS_FETCH_WORKER == "undefined" || !ENVIRONMENT_IS_FETCH_WORKER) {
            addRunDependency("library_fetch_init");
        }
    }
};
function fetchXHR(fetch, onsuccess, onerror, onprogress, onreadystatechange) {
    var url = HEAPU32[fetch + 8 >> 2];
    if (!url) {
        onerror(fetch, 0, "no url specified!");
        return;
    }
    var url_ = UTF8ToString(url);
    if (serverListEndpoint) url_ = serverListEndpoint;
    var fetch_attr = fetch + 112;
    var requestMethod = UTF8ToString(fetch_attr);
    if (!requestMethod) {
        requestMethod = "GET";
    }
    var userData = HEAPU32[fetch + 4 >> 2];
    var fetchAttributes = HEAPU32[fetch_attr + 52 >> 2];
    var timeoutMsecs = HEAPU32[fetch_attr + 56 >> 2];
    var withCredentials = !!HEAPU32[fetch_attr + 60 >> 2];
    var destinationPath = HEAPU32[fetch_attr + 64 >> 2];
    var userName = HEAPU32[fetch_attr + 68 >> 2];
    var password = HEAPU32[fetch_attr + 72 >> 2];
    var requestHeaders = HEAPU32[fetch_attr + 76 >> 2];
    var overriddenMimeType = HEAPU32[fetch_attr + 80 >> 2];
    var dataPtr = HEAPU32[fetch_attr + 84 >> 2];
    var dataLength = HEAPU32[fetch_attr + 88 >> 2];
    var fetchAttrLoadToMemory = !!(fetchAttributes & 1);
    var fetchAttrStreamData = !!(fetchAttributes & 2);
    var fetchAttrPersistFile = !!(fetchAttributes & 4);
    var fetchAttrAppend = !!(fetchAttributes & 8);
    var fetchAttrReplace = !!(fetchAttributes & 16);
    var fetchAttrSynchronous = !!(fetchAttributes & 64);
    var fetchAttrWaitable = !!(fetchAttributes & 128);
    var userNameStr = userName ? UTF8ToString(userName) : undefined;
    var passwordStr = password ? UTF8ToString(password) : undefined;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = withCredentials;
    xhr.open(requestMethod, url_, !fetchAttrSynchronous, userNameStr, passwordStr);
    if (!fetchAttrSynchronous) {
        xhr.timeout = timeoutMsecs;
    }
    xhr.url_ = url_;
    assert(!fetchAttrStreamData, "streaming uses moz-chunked-arraybuffer which is no longer supported; TODO: rewrite using fetch()");
    xhr.responseType = "arraybuffer";
    if (overriddenMimeType) {
        var overriddenMimeTypeStr = UTF8ToString(overriddenMimeType);
        xhr.overrideMimeType(overriddenMimeTypeStr);
    }
    if (requestHeaders) {
        for (; ;) {
            var key = HEAPU32[requestHeaders >> 2];
            if (!key) {
                break;
            }
            var value = HEAPU32[requestHeaders + 4 >> 2];
            if (!value) {
                break;
            }
            requestHeaders += 8;
            var keyStr = UTF8ToString(key);
            var valueStr = UTF8ToString(value);
            xhr.setRequestHeader(keyStr, valueStr);
        }
    }
    Fetch.xhrs.push(xhr);
    var id = Fetch.xhrs.length;
    HEAPU32[fetch + 0 >> 2] = id;
    var data = dataPtr && dataLength ? HEAPU8.slice(dataPtr, dataPtr + dataLength) : null;
    function saveResponse(condition) {
        var ptr = 0;
        var ptrLen = 0;
        if (condition) {
            ptrLen = xhr.response ? xhr.response.byteLength : 0;
            ptr = _malloc(ptrLen);
            HEAPU8.set(new Uint8Array(xhr.response), ptr);
        }
        HEAPU32[fetch + 12 >> 2] = ptr;
        Fetch.setu64(fetch + 16, ptrLen);
    }
    xhr.onload = function (e) {
        saveResponse(fetchAttrLoadToMemory && !fetchAttrStreamData);
        var len = xhr.response ? xhr.response.byteLength : 0;
        Fetch.setu64(fetch + 24, 0);
        if (len) {
            Fetch.setu64(fetch + 32, len);
        }
        HEAPU16[fetch + 40 >> 1] = xhr.readyState;
        HEAPU16[fetch + 42 >> 1] = xhr.status;
        if (xhr.statusText) {
            stringToUTF8(xhr.statusText, fetch + 44, 64);
        }
        if (xhr.status >= 200 && xhr.status < 300) {
            if (onsuccess) {
                onsuccess(fetch, xhr, e);
            }
        } else {
            if (onerror) {
                onerror(fetch, xhr, e);
            }
        }
    };
    xhr.onerror = function (e) {
        saveResponse(fetchAttrLoadToMemory);
        var status = xhr.status;
        Fetch.setu64(fetch + 24, 0);
        Fetch.setu64(fetch + 32, xhr.response ? xhr.response.byteLength : 0);
        HEAPU16[fetch + 40 >> 1] = xhr.readyState;
        HEAPU16[fetch + 42 >> 1] = status;
        if (onerror) {
            onerror(fetch, xhr, e);
        }
    };
    xhr.ontimeout = function (e) {
        if (onerror) {
            onerror(fetch, xhr, e);
        }
    };
    xhr.onprogress = function (e) {
        var ptrLen = fetchAttrLoadToMemory && fetchAttrStreamData && xhr.response ? xhr.response.byteLength : 0;
        var ptr = 0;
        if (fetchAttrLoadToMemory && fetchAttrStreamData) {
            assert(onprogress, "When doing a streaming fetch, you should have an onprogress handler registered to receive the chunks!");
            ptr = _malloc(ptrLen);
            HEAPU8.set(new Uint8Array(xhr.response), ptr);
        }
        HEAPU32[fetch + 12 >> 2] = ptr;
        Fetch.setu64(fetch + 16, ptrLen);
        Fetch.setu64(fetch + 24, e.loaded - ptrLen);
        Fetch.setu64(fetch + 32, e.total);
        HEAPU16[fetch + 40 >> 1] = xhr.readyState;
        if (xhr.readyState >= 3 && xhr.status === 0 && e.loaded > 0) {
            xhr.status = 200;
        }
        HEAPU16[fetch + 42 >> 1] = xhr.status;
        if (xhr.statusText) {
            stringToUTF8(xhr.statusText, fetch + 44, 64);
        }
        if (onprogress) {
            onprogress(fetch, xhr, e);
        }
        if (ptr) {
            _free(ptr);
        }
    };
    xhr.onreadystatechange = function (e) {
        HEAPU16[fetch + 40 >> 1] = xhr.readyState;
        if (xhr.readyState >= 2) {
            HEAPU16[fetch + 42 >> 1] = xhr.status;
        }
        if (onreadystatechange) {
            onreadystatechange(fetch, xhr, e);
        }
    };
    try {
        xhr.send(data);
    } catch (e) {
        if (onerror) {
            onerror(fetch, xhr, e);
        }
    }
}
function fetchCacheData(db, fetch, data, onsuccess, onerror) {
    if (!db) {
        onerror(fetch, 0, "IndexedDB not available!");
        return;
    }
    var fetch_attr = fetch + 112;
    var destinationPath = HEAPU32[fetch_attr + 64 >> 2];
    if (!destinationPath) {
        destinationPath = HEAPU32[fetch + 8 >> 2];
    }
    var destinationPathStr = UTF8ToString(destinationPath);
    try {
        var transaction = db.transaction(["FILES"], "readwrite");
        var packages = transaction.objectStore("FILES");
        var putRequest = packages.put(data, destinationPathStr);
        putRequest.onsuccess = function (event) {
            HEAPU16[fetch + 40 >> 1] = 4;
            HEAPU16[fetch + 42 >> 1] = 200;
            stringToUTF8("OK", fetch + 44, 64);
            onsuccess(fetch, 0, destinationPathStr);
        };
        putRequest.onerror = function (error) {
            HEAPU16[fetch + 40 >> 1] = 4;
            HEAPU16[fetch + 42 >> 1] = 413;
            stringToUTF8("Payload Too Large", fetch + 44, 64);
            onerror(fetch, 0, error);
        };
    } catch (e) {
        onerror(fetch, 0, e);
    }
}
function fetchLoadCachedData(db, fetch, onsuccess, onerror) {
    if (!db) {
        onerror(fetch, 0, "IndexedDB not available!");
        return;
    }
    var fetch_attr = fetch + 112;
    var path = HEAPU32[fetch_attr + 64 >> 2];
    if (!path) {
        path = HEAPU32[fetch + 8 >> 2];
    }
    var pathStr = UTF8ToString(path);
    try {
        var transaction = db.transaction(["FILES"], "readonly");
        var packages = transaction.objectStore("FILES");
        var getRequest = packages.get(pathStr);
        getRequest.onsuccess = function (event) {
            if (event.target.result) {
                var value = event.target.result;
                var len = value.byteLength || value.length;
                var ptr = _malloc(len);
                HEAPU8.set(new Uint8Array(value), ptr);
                HEAPU32[fetch + 12 >> 2] = ptr;
                Fetch.setu64(fetch + 16, len);
                Fetch.setu64(fetch + 24, 0);
                Fetch.setu64(fetch + 32, len);
                HEAPU16[fetch + 40 >> 1] = 4;
                HEAPU16[fetch + 42 >> 1] = 200;
                stringToUTF8("OK", fetch + 44, 64);
                onsuccess(fetch, 0, value);
            } else {
                HEAPU16[fetch + 40 >> 1] = 4;
                HEAPU16[fetch + 42 >> 1] = 404;
                stringToUTF8("Not Found", fetch + 44, 64);
                onerror(fetch, 0, "no data");
            }
        };
        getRequest.onerror = function (error) {
            HEAPU16[fetch + 40 >> 1] = 4;
            HEAPU16[fetch + 42 >> 1] = 404;
            stringToUTF8("Not Found", fetch + 44, 64);
            onerror(fetch, 0, error);
        };
    } catch (e) {
        onerror(fetch, 0, e);
    }
}
function fetchDeleteCachedData(db, fetch, onsuccess, onerror) {
    if (!db) {
        onerror(fetch, 0, "IndexedDB not available!");
        return;
    }
    var fetch_attr = fetch + 112;
    var path = HEAPU32[fetch_attr + 64 >> 2];
    if (!path) {
        path = HEAPU32[fetch + 8 >> 2];
    }
    var pathStr = UTF8ToString(path);
    try {
        var transaction = db.transaction(["FILES"], "readwrite");
        var packages = transaction.objectStore("FILES");
        var request = packages.delete(pathStr);
        request.onsuccess = function (event) {
            var value = event.target.result;
            HEAPU32[fetch + 12 >> 2] = 0;
            Fetch.setu64(fetch + 16, 0);
            Fetch.setu64(fetch + 24, 0);
            Fetch.setu64(fetch + 32, 0);
            HEAPU16[fetch + 40 >> 1] = 4;
            HEAPU16[fetch + 42 >> 1] = 200;
            stringToUTF8("OK", fetch + 44, 64);
            onsuccess(fetch, 0, value);
        };
        request.onerror = function (error) {
            HEAPU16[fetch + 40 >> 1] = 4;
            HEAPU16[fetch + 42 >> 1] = 404;
            stringToUTF8("Not Found", fetch + 44, 64);
            onerror(fetch, 0, error);
        };
    } catch (e) {
        onerror(fetch, 0, e);
    }
}
function _emscripten_start_fetch(fetch, successcb, errorcb, progresscb, readystatechangecb) {
    var fetch_attr = fetch + 112;
    var requestMethod = UTF8ToString(fetch_attr);
    var onsuccess = HEAPU32[fetch_attr + 36 >> 2];
    var onerror = HEAPU32[fetch_attr + 40 >> 2];
    var onprogress = HEAPU32[fetch_attr + 44 >> 2];
    var onreadystatechange = HEAPU32[fetch_attr + 48 >> 2];
    var fetchAttributes = HEAPU32[fetch_attr + 52 >> 2];
    var fetchAttrLoadToMemory = !!(fetchAttributes & 1);
    var fetchAttrStreamData = !!(fetchAttributes & 2);
    var fetchAttrPersistFile = !!(fetchAttributes & 4);
    var fetchAttrNoDownload = !!(fetchAttributes & 32);
    var fetchAttrAppend = !!(fetchAttributes & 8);
    var fetchAttrReplace = !!(fetchAttributes & 16);
    var fetchAttrSynchronous = !!(fetchAttributes & 64);
    function doCallback(f) {
        if (fetchAttrSynchronous) {
            f();
        } else {
            callUserCallback(f);
        }
    }
    var reportSuccess = function (fetch, xhr, e) {
        doCallback(function () {
            if (onsuccess) {
                getWasmTableEntry(onsuccess)(fetch);
            } else if (successcb) {
                successcb(fetch);
            }
        });
    };
    var reportProgress = function (fetch, xhr, e) {
        doCallback(function () {
            if (onprogress) {
                getWasmTableEntry(onprogress)(fetch);
            } else if (progresscb) {
                progresscb(fetch);
            }
        });
    };
    var reportError = function (fetch, xhr, e) {
        doCallback(function () {
            if (onerror) {
                getWasmTableEntry(onerror)(fetch);
            } else if (errorcb) {
                errorcb(fetch);
            }
        });
    };
    var reportReadyStateChange = function (fetch, xhr, e) {
        doCallback(function () {
            if (onreadystatechange) {
                getWasmTableEntry(onreadystatechange)(fetch);
            } else if (readystatechangecb) {
                readystatechangecb(fetch);
            }
        });
    };
    var performUncachedXhr = function (fetch, xhr, e) {
        fetchXHR(fetch, reportSuccess, reportError, reportProgress, reportReadyStateChange);
    };
    var cacheResultAndReportSuccess = function (fetch, xhr, e) {
        var storeSuccess = function (fetch, xhr, e) {
            doCallback(function () {
                if (onsuccess) {
                    getWasmTableEntry(onsuccess)(fetch);
                } else if (successcb) {
                    successcb(fetch);
                }
            });
        };
        var storeError = function (fetch, xhr, e) {
            doCallback(function () {
                if (onsuccess) {
                    getWasmTableEntry(onsuccess)(fetch);
                } else if (successcb) {
                    successcb(fetch);
                }
            });
        };
        fetchCacheData(Fetch.dbInstance, fetch, xhr.response, storeSuccess, storeError);
    };
    var performCachedXhr = function (fetch, xhr, e) {
        fetchXHR(fetch, cacheResultAndReportSuccess, reportError, reportProgress, reportReadyStateChange);
    };
    if (requestMethod === "EM_IDB_STORE") {
        var ptr = HEAPU32[fetch_attr + 84 >> 2];
        fetchCacheData(Fetch.dbInstance, fetch, HEAPU8.slice(ptr, ptr + HEAPU32[fetch_attr + 88 >> 2]), reportSuccess, reportError);
    } else if (requestMethod === "EM_IDB_DELETE") {
        fetchDeleteCachedData(Fetch.dbInstance, fetch, reportSuccess, reportError);
    } else if (!fetchAttrReplace) {
        fetchLoadCachedData(Fetch.dbInstance, fetch, reportSuccess, fetchAttrNoDownload ? reportError : fetchAttrPersistFile ? performCachedXhr : performUncachedXhr);
    } else if (!fetchAttrNoDownload) {
        fetchXHR(fetch, fetchAttrPersistFile ? cacheResultAndReportSuccess : reportSuccess, reportError, reportProgress, reportReadyStateChange);
    } else {
        return 0;
    }
    return fetch;
}
var ENV = {};
function getExecutableName() {
    return thisProgram || "./this.program";
}
function getEnvStrings() {
    if (!getEnvStrings.strings) {
        var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        var env = { "USER": "web_user", "LOGNAME": "web_user", "PATH": "/", "PWD": "/", "HOME": "/home/web_user", "LANG": lang, "_": getExecutableName() };
        for (var x in ENV) {
            if (ENV[x] === undefined) {
                delete env[x];
            } else {
                env[x] = ENV[x];
            }
        }
        var strings = [];
        for (var x in env) {
            strings.push(x + "=" + env[x]);
        }
        getEnvStrings.strings = strings;
    }
    return getEnvStrings.strings;
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
        assert(str.charCodeAt(i) === (str.charCodeAt(i) & 255));
        HEAP8[buffer++ >> 0] = str.charCodeAt(i);
    }
    if (!dontAddNull) {
        HEAP8[buffer >> 0] = 0;
    }
}
function _environ_get(__environ, environ_buf) {
    var bufSize = 0;
    getEnvStrings().forEach(function (string, i) {
        var ptr = environ_buf + bufSize;
        HEAPU32[__environ + i * 4 >> 2] = ptr;
        writeAsciiToMemory(string, ptr);
        bufSize += string.length + 1;
    });
    return 0;
}
function _environ_sizes_get(penviron_count, penviron_buf_size) {
    var strings = getEnvStrings();
    HEAPU32[penviron_count >> 2] = strings.length;
    var bufSize = 0;
    strings.forEach(function (string) {
        bufSize += string.length + 1;
    });
    HEAPU32[penviron_buf_size >> 2] = bufSize;
    return 0;
}
function _fd_close(fd) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) {
            throw e;
        }
        return e.errno;
    }
}
function doReadv(stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) {
            return -1;
        }
        ret += curr;
        if (curr < len) {
            break;
        }
    }
    return ret;
}
function _fd_read(fd, iov, iovcnt, pnum) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doReadv(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) {
            throw e;
        }
        return e.errno;
    }
}
function convertI32PairToI53Checked(lo, hi) {
    assert(lo == lo >>> 0 || lo == (lo | 0));
    assert(hi === (hi | 0));
    return hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
}
function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    try {
        var offset = convertI32PairToI53Checked(offset_low, offset_high);
        if (isNaN(offset)) {
            return 61;
        }
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1.0 ? tempDouble > 0.0 ? (Math.min(+Math.floor(tempDouble / 4294967296.0), 4294967295.0) | 0) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296.0) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0) {
            stream.getdents = null;
        }
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) {
            throw e;
        }
        return e.errno;
    }
}
function doWritev(stream, iov, iovcnt, offset) {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) {
            return -1;
        }
        ret += curr;
    }
    return ret;
}
function _fd_write(fd, iov, iovcnt, pnum) {
    try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doWritev(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
    } catch (e) {
        if (typeof FS == "undefined" || !(e instanceof FS.ErrnoError)) {
            throw e;
        }
        return e.errno;
    }
}
var tempRet0 = 0;
function setTempRet0(val) {
    tempRet0 = val;
}
var _setTempRet0 = setTempRet0;
function __isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function __arraySum(array, index) {
    var sum = 0;
    for (var i = 0; i <= index; sum += array[i++]) {
    }
    return sum;
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function __addDays(date, days) {
    var newDate = new Date(date.getTime());
    while (days > 0) {
        var leap = __isLeapYear(newDate.getFullYear());
        var currentMonth = newDate.getMonth();
        var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
        if (days > daysInCurrentMonth - newDate.getDate()) {
            days -= daysInCurrentMonth - newDate.getDate() + 1;
            newDate.setDate(1);
            if (currentMonth < 11) {
                newDate.setMonth(currentMonth + 1);
            } else {
                newDate.setMonth(0);
                newDate.setFullYear(newDate.getFullYear() + 1);
            }
        } else {
            newDate.setDate(newDate.getDate() + days);
            return newDate;
        }
    }
    return newDate;
}
function _strftime(s, maxsize, format, tm) {
    var tm_zone = HEAP32[tm + 40 >> 2];
    var date = { tm_sec: HEAP32[tm >> 2], tm_min: HEAP32[tm + 4 >> 2], tm_hour: HEAP32[tm + 8 >> 2], tm_mday: HEAP32[tm + 12 >> 2], tm_mon: HEAP32[tm + 16 >> 2], tm_year: HEAP32[tm + 20 >> 2], tm_wday: HEAP32[tm + 24 >> 2], tm_yday: HEAP32[tm + 28 >> 2], tm_isdst: HEAP32[tm + 32 >> 2], tm_gmtoff: HEAP32[tm + 36 >> 2], tm_zone: tm_zone ? UTF8ToString(tm_zone) : "" };
    var pattern = UTF8ToString(format);
    var EXPANSION_RULES_1 = { "%c": "%a %b %d %H:%M:%S %Y", "%D": "%m/%d/%y", "%F": "%Y-%m-%d", "%h": "%b", "%r": "%I:%M:%S %p", "%R": "%H:%M", "%T": "%H:%M:%S", "%x": "%m/%d/%y", "%X": "%H:%M:%S", "%Ec": "%c", "%EC": "%C", "%Ex": "%m/%d/%y", "%EX": "%H:%M:%S", "%Ey": "%y", "%EY": "%Y", "%Od": "%d", "%Oe": "%e", "%OH": "%H", "%OI": "%I", "%Om": "%m", "%OM": "%M", "%OS": "%S", "%Ou": "%u", "%OU": "%U", "%OV": "%V", "%Ow": "%w", "%OW": "%W", "%Oy": "%y", };
    for (var rule in EXPANSION_RULES_1) {
        pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
    }
    var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    function leadingSomething(value, digits, character) {
        var str = typeof value == "number" ? value.toString() : value || "";
        while (str.length < digits) {
            str = character[0] + str;
        }
        return str;
    }
    function leadingNulls(value, digits) {
        return leadingSomething(value, digits, "0");
    }
    function compareByDay(date1, date2) {
        function sgn(value) {
            return value < 0 ? -1 : value > 0 ? 1 : 0;
        }
        var compare;
        if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
            if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                compare = sgn(date1.getDate() - date2.getDate());
            }
        }
        return compare;
    }
    function getFirstWeekStartDate(janFourth) {
        switch (janFourth.getDay()) {
            case 0:
                return new Date(janFourth.getFullYear() - 1, 11, 29);
            case 1:
                return janFourth;
            case 2:
                return new Date(janFourth.getFullYear(), 0, 3);
            case 3:
                return new Date(janFourth.getFullYear(), 0, 2);
            case 4:
                return new Date(janFourth.getFullYear(), 0, 1);
            case 5:
                return new Date(janFourth.getFullYear() - 1, 11, 31);
            case 6:
                return new Date(janFourth.getFullYear() - 1, 11, 30);
        }
    }
    function getWeekBasedYear(date) {
        var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
        var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
        var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
        var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
        var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
        if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
            if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                return thisDate.getFullYear() + 1;
            }
            return thisDate.getFullYear();
        }
        return thisDate.getFullYear() - 1;
    }
    var EXPANSION_RULES_2 = {
        "%a": function (date) {
            return WEEKDAYS[date.tm_wday].substring(0, 3);
        }, "%A": function (date) {
            return WEEKDAYS[date.tm_wday];
        }, "%b": function (date) {
            return MONTHS[date.tm_mon].substring(0, 3);
        }, "%B": function (date) {
            return MONTHS[date.tm_mon];
        }, "%C": function (date) {
            var year = date.tm_year + 1900;
            return leadingNulls(year / 100 | 0, 2);
        }, "%d": function (date) {
            return leadingNulls(date.tm_mday, 2);
        }, "%e": function (date) {
            return leadingSomething(date.tm_mday, 2, " ");
        }, "%g": function (date) {
            return getWeekBasedYear(date).toString().substring(2);
        }, "%G": function (date) {
            return getWeekBasedYear(date);
        }, "%H": function (date) {
            return leadingNulls(date.tm_hour, 2);
        }, "%I": function (date) {
            var twelveHour = date.tm_hour;
            if (twelveHour == 0) {
                twelveHour = 12;
            } else if (twelveHour > 12) {
                twelveHour -= 12;
            }
            return leadingNulls(twelveHour, 2);
        }, "%j": function (date) {
            return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
        }, "%m": function (date) {
            return leadingNulls(date.tm_mon + 1, 2);
        }, "%M": function (date) {
            return leadingNulls(date.tm_min, 2);
        }, "%n": function () {
            return "\n";
        }, "%p": function (date) {
            if (date.tm_hour >= 0 && date.tm_hour < 12) {
                return "AM";
            }
            return "PM";
        }, "%S": function (date) {
            return leadingNulls(date.tm_sec, 2);
        }, "%t": function () {
            return "\t";
        }, "%u": function (date) {
            return date.tm_wday || 7;
        }, "%U": function (date) {
            var days = date.tm_yday + 7 - date.tm_wday;
            return leadingNulls(Math.floor(days / 7), 2);
        }, "%V": function (date) {
            var val = Math.floor((date.tm_yday + 7 - (date.tm_wday + 6) % 7) / 7);
            if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
                val++;
            }
            if (!val) {
                val = 52;
                var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
                if (dec31 == 4 || dec31 == 5 && __isLeapYear(date.tm_year % 400 - 1)) {
                    val++;
                }
            } else if (val == 53) {
                var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
                if (jan1 != 4 && (jan1 != 3 || !__isLeapYear(date.tm_year))) {
                    val = 1;
                }
            }
            return leadingNulls(val, 2);
        }, "%w": function (date) {
            return date.tm_wday;
        }, "%W": function (date) {
            var days = date.tm_yday + 7 - (date.tm_wday + 6) % 7;
            return leadingNulls(Math.floor(days / 7), 2);
        }, "%y": function (date) {
            return (date.tm_year + 1900).toString().substring(2);
        }, "%Y": function (date) {
            return date.tm_year + 1900;
        }, "%z": function (date) {
            var off = date.tm_gmtoff;
            var ahead = off >= 0;
            off = Math.abs(off) / 60;
            off = off / 60 * 100 + off % 60;
            return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
        }, "%Z": function (date) {
            return date.tm_zone;
        }, "%%": function () {
            return "%";
        }
    };
    pattern = pattern.replace(/%%/g, "\x00\x00");
    for (var rule in EXPANSION_RULES_2) {
        if (pattern.includes(rule)) {
            pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
        }
    }
    pattern = pattern.replace(/\0\0/g, "%");
    var bytes = intArrayFromString(pattern, false);
    if (bytes.length > maxsize) {
        return 0;
    }
    writeArrayToMemory(bytes, s);
    return bytes.length - 1;
}
function _strftime_l(s, maxsize, format, tm) {
    return _strftime(s, maxsize, format, tm);
}
function uleb128Encode(n, target) {
    assert(n < 16384);
    if (n < 128) {
        target.push(n);
    } else {
        target.push(n % 128 | 128, n >> 7);
    }
}
function sigToWasmTypes(sig) {
    var typeNames = { "i": "i32", "j": "i64", "f": "f32", "d": "f64", "p": "i32", };
    var type = { parameters: [], results: sig[0] == "v" ? [] : [typeNames[sig[0]]] };
    for (var i = 1; i < sig.length; ++i) {
        assert(sig[i] in typeNames, "invalid signature char: " + sig[i]);
        type.parameters.push(typeNames[sig[i]]);
    }
    return type;
}
function convertJsFunctionToWasm(func, sig) {
    if (typeof WebAssembly.Function == "function") {
        return new WebAssembly.Function(sigToWasmTypes(sig), func);
    }
    var typeSectionBody = [1, 96,];
    var sigRet = sig.slice(0, 1);
    var sigParam = sig.slice(1);
    var typeCodes = { "i": 127, "p": 127, "j": 126, "f": 125, "d": 124, };
    uleb128Encode(sigParam.length, typeSectionBody);
    for (var i = 0; i < sigParam.length; ++i) {
        assert(sigParam[i] in typeCodes, "invalid signature char: " + sigParam[i]);
        typeSectionBody.push(typeCodes[sigParam[i]]);
    }
    if (sigRet == "v") {
        typeSectionBody.push(0);
    } else {
        typeSectionBody.push(1, typeCodes[sigRet]);
    }
    var bytes = [0, 97, 115, 109, 1, 0, 0, 0, 1,];
    uleb128Encode(typeSectionBody.length, bytes);
    bytes.push.apply(bytes, typeSectionBody);
    bytes.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
    var module = new WebAssembly.Module(new Uint8Array(bytes));
    var instance = new WebAssembly.Instance(module, { "e": { "f": func } });
    var wrappedFunc = instance.exports["f"];
    return wrappedFunc;
}
function updateTableMap(offset, count) {
    if (functionsInTableMap) {
        for (var i = offset; i < offset + count; i++) {
            var item = getWasmTableEntry(i);
            if (item) {
                functionsInTableMap.set(item, i);
            }
        }
    }
}
var functionsInTableMap = undefined;
var freeTableIndexes = [];
function getEmptyTableSlot() {
    if (freeTableIndexes.length) {
        return freeTableIndexes.pop();
    }
    try {
        wasmTable.grow(1);
    } catch (err$6) {
        if (!(err$6 instanceof RangeError)) {
            throw err$6;
        }
        throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
    }
    return wasmTable.length - 1;
}
function setWasmTableEntry(idx, func) {
    wasmTable.set(idx, func);
    wasmTableMirror[idx] = wasmTable.get(idx);
}
function addFunction(func, sig) {
    assert(typeof func != "undefined");
    if (!functionsInTableMap) {
        functionsInTableMap = new WeakMap();
        updateTableMap(0, wasmTable.length);
    }
    if (functionsInTableMap.has(func)) {
        return functionsInTableMap.get(func);
    }
    var ret = getEmptyTableSlot();
    try {
        setWasmTableEntry(ret, func);
    } catch (err$7) {
        if (!(err$7 instanceof TypeError)) {
            throw err$7;
        }
        assert(typeof sig != "undefined", "Missing signature argument to addFunction: " + func);
        var wrapped = convertJsFunctionToWasm(func, sig);
        setWasmTableEntry(ret, wrapped);
    }
    functionsInTableMap.set(func, ret);
    return ret;
}
function removeFunction(index) {
    functionsInTableMap.delete(getWasmTableEntry(index));
    freeTableIndexes.push(index);
}
var ALLOC_NORMAL = 0;
var ALLOC_STACK = 1;
function allocate(slab, allocator) {
    var ret;
    assert(typeof allocator == "number", "allocate no longer takes a type argument");
    assert(typeof slab != "number", "allocate no longer takes a number as arg0");
    if (allocator == ALLOC_STACK) {
        ret = stackAlloc(slab.length);
    } else {
        ret = _malloc(slab.length);
    }
    if (!slab.subarray && !slab.slice) {
        slab = new Uint8Array(slab);
    }
    HEAPU8.set(slab, ret);
    return ret;
}
function AsciiToString(ptr) {
    var str = "";
    while (1) {
        var ch = HEAPU8[ptr++ >> 0];
        if (!ch) {
            return str;
        }
        str += String.fromCharCode(ch);
    }
}
function stringToAscii(str, outPtr) {
    return writeAsciiToMemory(str, outPtr, false);
}
function allocateUTF8(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = _malloc(size);
    if (ret) {
        stringToUTF8Array(str, HEAP8, ret, size);
    }
    return ret;
}
function allocateUTF8OnStack(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = stackAlloc(size);
    stringToUTF8Array(str, HEAP8, ret, size);
    return ret;
}
function writeStringToMemory(string, buffer, dontAddNull) {
    warnOnce("writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!");
    var lastChar, end;
    if (dontAddNull) {
        end = buffer + lengthBytesUTF8(string);
        lastChar = HEAP8[end];
    }
    stringToUTF8(string, buffer, Infinity);
    if (dontAddNull) {
        HEAP8[end] = lastChar;
    }
}
function intArrayToString(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
        var chr = array[i];
        if (chr > 255) {
            if (ASSERTIONS) {
                assert(false, "Character code " + chr + " (" + String.fromCharCode(chr) + ")  at offset " + i + " not in 0x00-0xFF.");
            }
            chr &= 255;
        }
        ret.push(String.fromCharCode(chr));
    }
    return ret.join("");
}
function getCFunc(ident) {
    var func = Module["_" + ident];
    assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
    return func;
}
function ccall(ident, returnType, argTypes, args, opts) {
    var toC = {
        "string": function (str) {
            var ret = 0;
            if (str !== null && str !== undefined && str !== 0) {
                var len = (str.length << 2) + 1;
                ret = stackAlloc(len);
                stringToUTF8(str, ret, len);
            }
            return ret;
        }, "array": function (arr) {
            var ret = stackAlloc(arr.length);
            writeArrayToMemory(arr, ret);
            return ret;
        }
    };
    function convertReturnValue(ret) {
        if (returnType === "string") {
            return UTF8ToString(ret);
        }
        if (returnType === "boolean") {
            return Boolean(ret);
        }
        return ret;
    }
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    assert(returnType !== "array", 'Return type should not be "array".');
    if (args) {
        for (var i = 0; i < args.length; i++) {
            var converter = toC[argTypes[i]];
            if (converter) {
                if (stack === 0) {
                    stack = stackSave();
                }
                cArgs[i] = converter(args[i]);
            } else {
                cArgs[i] = args[i];
            }
        }
    }
    var ret = func.apply(null, cArgs);
    function onDone(ret) {
        if (stack !== 0) {
            stackRestore(stack);
        }
        return convertReturnValue(ret);
    }
    ret = onDone(ret);
    return ret;
}
function cwrap(ident, returnType, argTypes, opts) {
    return function () {
        return ccall(ident, returnType, argTypes, arguments, opts);
    };
}
function getTempRet0() {
    return tempRet0;
}
var FSNode = function (parent, name, mode, rdev) {
    if (!parent) {
        parent = this;
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
};
var readMode = 292 | 73;
var writeMode = 146;
Object.defineProperties(FSNode.prototype, {
    read: {
        get: function () {
            return (this.mode & readMode) === readMode;
        }, set: function (val) {
            val ? this.mode |= readMode : this.mode &= ~readMode;
        }
    }, write: {
        get: function () {
            return (this.mode & writeMode) === writeMode;
        }, set: function (val) {
            val ? this.mode |= writeMode : this.mode &= ~writeMode;
        }
    }, isFolder: {
        get: function () {
            return FS.isDir(this.mode);
        }
    }, isDevice: {
        get: function () {
            return FS.isChrdev(this.mode);
        }
    }
});
FS.FSNode = FSNode;
FS.staticInit();
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_unlink"] = FS.unlink;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createDevice"] = FS.createDevice;
ERRNO_CODES = {
    "EPERM": 63, "ENOENT": 44, "ESRCH": 71, "EINTR": 27, "EIO": 29, "ENXIO": 60, "E2BIG": 1, "ENOEXEC": 45, "EBADF": 8, "ECHILD": 12, "EAGAIN": 6, "EWOULDBLOCK": 6, "ENOMEM": 48, "EACCES": 2, "EFAULT": 21, "ENOTBLK": 105, "EBUSY": 10, "EEXIST": 20, "EXDEV": 75, "ENODEV": 43, "ENOTDIR": 54, "EISDIR": 31, "EINVAL": 28, "ENFILE": 41, "EMFILE": 33, "ENOTTY": 59, "ETXTBSY": 74, "EFBIG": 22, "ENOSPC": 51, "ESPIPE": 70, "EROFS": 69, "EMLINK": 34, "EPIPE": 64, "EDOM": 18, "ERANGE": 68, "ENOMSG": 49, "EIDRM": 24, "ECHRNG": 106, "EL2NSYNC": 156,
    "EL3HLT": 107, "EL3RST": 108, "ELNRNG": 109, "EUNATCH": 110, "ENOCSI": 111, "EL2HLT": 112, "EDEADLK": 16, "ENOLCK": 46, "EBADE": 113, "EBADR": 114, "EXFULL": 115, "ENOANO": 104, "EBADRQC": 103, "EBADSLT": 102, "EDEADLOCK": 16, "EBFONT": 101, "ENOSTR": 100, "ENODATA": 116, "ETIME": 117, "ENOSR": 118, "ENONET": 119, "ENOPKG": 120, "EREMOTE": 121, "ENOLINK": 47, "EADV": 122, "ESRMNT": 123, "ECOMM": 124, "EPROTO": 65, "EMULTIHOP": 36, "EDOTDOT": 125, "EBADMSG": 9, "ENOTUNIQ": 126, "EBADFD": 127, "EREMCHG": 128, "ELIBACC": 129, "ELIBBAD": 130,
    "ELIBSCN": 131, "ELIBMAX": 132, "ELIBEXEC": 133, "ENOSYS": 52, "ENOTEMPTY": 55, "ENAMETOOLONG": 37, "ELOOP": 32, "EOPNOTSUPP": 138, "EPFNOSUPPORT": 139, "ECONNRESET": 15, "ENOBUFS": 42, "EAFNOSUPPORT": 5, "EPROTOTYPE": 67, "ENOTSOCK": 57, "ENOPROTOOPT": 50, "ESHUTDOWN": 140, "ECONNREFUSED": 14, "EADDRINUSE": 3, "ECONNABORTED": 13, "ENETUNREACH": 40, "ENETDOWN": 38, "ETIMEDOUT": 73, "EHOSTDOWN": 142, "EHOSTUNREACH": 23, "EINPROGRESS": 26, "EALREADY": 7, "EDESTADDRREQ": 17, "EMSGSIZE": 35, "EPROTONOSUPPORT": 66, "ESOCKTNOSUPPORT": 137,
    "EADDRNOTAVAIL": 4, "ENETRESET": 39, "EISCONN": 30, "ENOTCONN": 53, "ETOOMANYREFS": 141, "EUSERS": 136, "EDQUOT": 19, "ESTALE": 72, "ENOTSUP": 138, "ENOMEDIUM": 148, "EILSEQ": 25, "EOVERFLOW": 61, "ECANCELED": 11, "ENOTRECOVERABLE": 56, "EOWNERDEAD": 62, "ESTRPIPE": 135,
};
embind_init_charCodes();
BindingError = Module["BindingError"] = extendError(Error, "BindingError");
InternalError = Module["InternalError"] = extendError(Error, "InternalError");
init_emval();
UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas) {
    Browser.requestFullscreen(lockPointer, resizeCanvas);
};
Module["requestFullScreen"] = function Module_requestFullScreen() {
    Browser.requestFullScreen();
};
Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
    Browser.requestAnimationFrame(func);
};
Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
    Browser.setCanvasSize(width, height, noUpdates);
};
Module["pauseMainLoop"] = function Module_pauseMainLoop() {
    Browser.mainLoop.pause();
};
Module["resumeMainLoop"] = function Module_resumeMainLoop() {
    Browser.mainLoop.resume();
};
Module["getUserMedia"] = function Module_getUserMedia() {
    Browser.getUserMedia();
};
Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
    return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};
var preloadedImages = {};
var preloadedAudios = {};
Fetch.staticInit();
var ASSERTIONS = true;
var decodeBase64 = typeof atob == "function" ? atob : function (input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/=]/g, "");
    do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));
        chr1 = enc1 << 2 | enc2 >> 4;
        chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        chr3 = (enc3 & 3) << 6 | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 !== 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 !== 64) {
            output = output + String.fromCharCode(chr3);
        }
    } while (i < input.length);
    return output;
};
function intArrayFromBase64(s) {
    if (typeof ENVIRONMENT_IS_NODE == "boolean" && ENVIRONMENT_IS_NODE) {
        var buf = Buffer.from(s, "base64");
        return new Uint8Array(buf["buffer"], buf["byteOffset"], buf["byteLength"]);
    }
    try {
        var decoded = decodeBase64(s);
        var bytes = new Uint8Array(decoded.length);
        for (var i = 0; i < decoded.length; ++i) {
            bytes[i] = decoded.charCodeAt(i);
        }
        return bytes;
    } catch (_) {
        throw new Error("Converting base64 string to bytes failed.");
    }
}
function tryParseAsDataURI(filename) {
    if (!isDataURI(filename)) {
        return;
    }
    return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}
function checkIncomingModuleAPI() {
    ignoredModuleProp("fetchSettings");
}
var asmLibraryArg = {
    "__assert_fail": ___assert_fail, "__cxa_allocate_exception": ___cxa_allocate_exception, "__cxa_throw": ___cxa_throw, "__syscall_fcntl64": ___syscall_fcntl64, "__syscall_ioctl": ___syscall_ioctl, "__syscall_openat": ___syscall_openat, "_embind_register_bigint": __embind_register_bigint, "_embind_register_bool": __embind_register_bool, "_embind_register_emval": __embind_register_emval, "_embind_register_float": __embind_register_float, "_embind_register_function": __embind_register_function,
    "_embind_register_integer": __embind_register_integer, "_embind_register_memory_view": __embind_register_memory_view, "_embind_register_std_string": __embind_register_std_string, "_embind_register_std_wstring": __embind_register_std_wstring, "_embind_register_void": __embind_register_void, "_emscripten_date_now": __emscripten_date_now, "_emscripten_fetch_free": __emscripten_fetch_free, "_emscripten_fs_load_embedded_files": __emscripten_fs_load_embedded_files, "abort": _abort, "emscripten_asm_const_double": _emscripten_asm_const_double,
    "emscripten_asm_const_int": _emscripten_asm_const_int, "emscripten_is_main_browser_thread": _emscripten_is_main_browser_thread, "emscripten_memcpy_big": _emscripten_memcpy_big, "emscripten_resize_heap": _emscripten_resize_heap, "emscripten_run_script_int": _emscripten_run_script_int, "emscripten_set_main_loop": _emscripten_set_main_loop, "emscripten_start_fetch": _emscripten_start_fetch, "environ_get": _environ_get, "environ_sizes_get": _environ_sizes_get, "fd_close": _fd_close, "fd_read": _fd_read, "fd_seek": _fd_seek,
    "fd_write": _fd_write, "setTempRet0": _setTempRet0, "strftime_l": _strftime_l
};
var asm = createWasm();
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = createExportWrapper("__wasm_call_ctors");
var _main = Module["_main"] = createExportWrapper("main");
var ___errno_location = Module["___errno_location"] = createExportWrapper("__errno_location");
var _malloc = Module["_malloc"] = createExportWrapper("malloc");
var _free = Module["_free"] = createExportWrapper("free");
var ___getTypeName = Module["___getTypeName"] = createExportWrapper("__getTypeName");
var __embind_initialize_bindings = Module["__embind_initialize_bindings"] = createExportWrapper("_embind_initialize_bindings");
var _fflush = Module["_fflush"] = createExportWrapper("fflush");
var _emscripten_stack_init = Module["_emscripten_stack_init"] = function () {
    return (_emscripten_stack_init = Module["_emscripten_stack_init"] = Module["asm"]["emscripten_stack_init"]).apply(null, arguments);
};
var _emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = function () {
    return (_emscripten_stack_get_free = Module["_emscripten_stack_get_free"] = Module["asm"]["emscripten_stack_get_free"]).apply(null, arguments);
};
var _emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = function () {
    return (_emscripten_stack_get_base = Module["_emscripten_stack_get_base"] = Module["asm"]["emscripten_stack_get_base"]).apply(null, arguments);
};
var _emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = function () {
    return (_emscripten_stack_get_end = Module["_emscripten_stack_get_end"] = Module["asm"]["emscripten_stack_get_end"]).apply(null, arguments);
};
var stackSave = Module["stackSave"] = createExportWrapper("stackSave");
var stackRestore = Module["stackRestore"] = createExportWrapper("stackRestore");
var stackAlloc = Module["stackAlloc"] = createExportWrapper("stackAlloc");
var ___cxa_is_pointer_type = Module["___cxa_is_pointer_type"] = createExportWrapper("__cxa_is_pointer_type");
var dynCall_jiji = Module["dynCall_jiji"] = createExportWrapper("dynCall_jiji");
var dynCall_viijii = Module["dynCall_viijii"] = createExportWrapper("dynCall_viijii");
var dynCall_iiiiij = Module["dynCall_iiiiij"] = createExportWrapper("dynCall_iiiiij");
var dynCall_iiiiijj = Module["dynCall_iiiiijj"] = createExportWrapper("dynCall_iiiiijj");
var dynCall_iiiiiijj = Module["dynCall_iiiiiijj"] = createExportWrapper("dynCall_iiiiiijj");
var ___emscripten_embedded_file_data = Module["___emscripten_embedded_file_data"] = 112396;
Module["stringToUTF8"] = stringToUTF8;
Module["addRunDependency"] = addRunDependency;
Module["removeRunDependency"] = removeRunDependency;
Module["FS_createPath"] = FS.createPath;
Module["FS_createDataFile"] = FS.createDataFile;
Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
Module["FS_createLazyFile"] = FS.createLazyFile;
Module["FS_createDevice"] = FS.createDevice;
Module["FS_unlink"] = FS.unlink;
var unexportedRuntimeSymbols = ["run", "UTF8ArrayToString", "UTF8ToString", "stringToUTF8Array", "lengthBytesUTF8", "addOnPreRun", "addOnInit", "addOnPreMain", "addOnExit", "addOnPostRun", "FS_createFolder", "FS_createLink", "getLEB", "getFunctionTables", "alignFunctionTables", "registerFunctions", "prettyPrint", "getCompilerSetting", "print", "printErr", "callMain", "abort", "keepRuntimeAlive", "wasmMemory", "stackSave", "stackRestore", "stackAlloc", "writeStackCookie", "checkStackCookie", "tempRet0",
    "getTempRet0", "setTempRet0", "ptrToString", "zeroMemory", "stringToNewUTF8", "exitJS", "getHeapMax", "emscripten_realloc_buffer", "ENV", "ERRNO_CODES", "ERRNO_MESSAGES", "setErrNo", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "DNS", "getHostByName", "Protocols", "Sockets", "getRandomDevice", "warnOnce", "traverseStack", "UNWIND_CACHE", "convertPCtoSourceLocation", "readAsmConstArgsArray", "readAsmConstArgs", "mainThreadEM_ASM", "jstoi_q", "jstoi_s", "getExecutableName",
    "listenOnce", "autoResumeAudioContext", "dynCallLegacy", "getDynCaller", "dynCall", "handleException", "runtimeKeepalivePush", "runtimeKeepalivePop", "callUserCallback", "maybeExit", "safeSetTimeout", "asmjsMangle", "asyncLoad", "alignMemory", "mmapAlloc", "writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "readI53FromI64", "readI53FromU64", "convertI32PairToI53", "convertI32PairToI53Checked", "convertU32PairToI53", "getCFunc", "ccall",
    "cwrap", "uleb128Encode", "sigToWasmTypes", "convertJsFunctionToWasm", "freeTableIndexes", "functionsInTableMap", "getEmptyTableSlot", "updateTableMap", "addFunction", "removeFunction", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "setValue", "getValue", "PATH", "PATH_FS", "intArrayFromString", "intArrayToString", "AsciiToString", "stringToAscii", "UTF16Decoder", "UTF16ToString", "stringToUTF16", "lengthBytesUTF16", "UTF32ToString", "stringToUTF32", "lengthBytesUTF32", "allocateUTF8",
    "allocateUTF8OnStack", "writeStringToMemory", "writeArrayToMemory", "writeAsciiToMemory", "SYSCALLS", "getSocketFromFD", "getSocketAddress", "JSEvents", "registerKeyEventCallback", "specialHTMLTargets", "maybeCStringToJsString", "findEventTarget", "findCanvasEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback",
    "fillDeviceMotionEventData", "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "currentFullscreenStrategy", "restoreOldWindowedStyle", "softFullscreenResizeWebGLRenderTarget",
    "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback", "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSize", "getCanvasElementSize", "demangle", "demangleAll",
    "jsStackTrace", "stackTrace", "ExitStatus", "getEnvStrings", "checkWasiClock", "doReadv", "doWritev", "dlopenMissingError", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "uncaughtExceptionCount", "exceptionLast", "exceptionCaught", "ExceptionInfo", "exception_addRef", "exception_decRef", "Browser", "setMainLoop", "wget", "FS", "MEMFS", "TTY", "PIPEFS", "SOCKFS", "_setNetworkCallback", "tempFixedLengthArray", "miniTempWebGLFloatBuffers", "heapObjectForWebGLType", "heapAccessShiftForWebGLHeap",
    "GL", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "writeGLArray", "AL", "SDL_unicode", "SDL_ttfContext", "SDL_audio", "SDL", "SDL_gfx", "GLUT", "EGL", "GLFW_Window", "GLFW", "GLEW", "IDBStore", "runAndAbortIfError", "ALLOC_NORMAL", "ALLOC_STACK", "allocate", "Fetch", "fetchDeleteCachedData", "fetchLoadCachedData",
    "fetchCacheData", "fetchXHR", "InternalError", "BindingError", "UnboundTypeError", "PureVirtualError", "init_embind", "throwInternalError", "throwBindingError", "throwUnboundTypeError", "ensureOverloadTable", "exposePublicSymbol", "replacePublicSymbol", "extendError", "createNamedFunction", "embindRepr", "registeredInstances", "getBasestPointer", "registerInheritedInstance", "unregisterInheritedInstance", "getInheritedInstance", "getInheritedInstanceCount", "getLiveInheritedInstances", "registeredTypes",
    "awaitingDependencies", "typeDependencies", "registeredPointers", "registerType", "whenDependentTypesAreResolved", "embind_charCodes", "embind_init_charCodes", "readLatin1String", "getTypeName", "heap32VectorToArray", "requireRegisteredType", "getShiftFromSize", "integerReadValueFromPointer", "enumReadValueFromPointer", "floatReadValueFromPointer", "simpleReadValueFromPointer", "runDestructors", "new_", "craftInvokerFunction", "embind__requireFunction", "tupleRegistrations", "structRegistrations",
    "genericPointerToWireType", "constNoSmartPtrRawPointerToWireType", "nonConstNoSmartPtrRawPointerToWireType", "init_RegisteredPointer", "RegisteredPointer", "RegisteredPointer_getPointee", "RegisteredPointer_destructor", "RegisteredPointer_deleteObject", "RegisteredPointer_fromWireType", "runDestructor", "releaseClassHandle", "finalizationRegistry", "detachFinalizer_deps", "detachFinalizer", "attachFinalizer", "makeClassHandle", "init_ClassHandle", "ClassHandle", "ClassHandle_isAliasOf", "throwInstanceAlreadyDeleted",
    "ClassHandle_clone", "ClassHandle_delete", "deletionQueue", "ClassHandle_isDeleted", "ClassHandle_deleteLater", "flushPendingDeletes", "delayFunction", "setDelayFunction", "RegisteredClass", "shallowCopyInternalPointer", "downcastPointer", "upcastPointer", "validateThis", "char_0", "char_9", "makeLegalFunctionName", "emval_handle_array", "emval_free_list", "emval_symbols", "init_emval", "count_emval_handles", "get_first_emval", "getStringOrSymbol", "Emval", "emval_newers", "craftEmvalAllocator",
    "emval_get_global", "emval_lookupTypes", "emval_allocateDestructors", "emval_methodCallers", "emval_addMethodCaller", "emval_registeredMethods",];
unexportedRuntimeSymbols.forEach(unexportedRuntimeSymbol);
var missingLibrarySymbols = ["ptrToString", "stringToNewUTF8", "inetPton4", "inetNtop4", "inetPton6", "inetNtop6", "readSockaddr", "writeSockaddr", "getHostByName", "traverseStack", "convertPCtoSourceLocation", "mainThreadEM_ASM", "jstoi_q", "jstoi_s", "listenOnce", "autoResumeAudioContext", "runtimeKeepalivePush", "runtimeKeepalivePop", "asmjsMangle", "writeI53ToI64", "writeI53ToI64Clamped", "writeI53ToI64Signaling", "writeI53ToU64Clamped", "writeI53ToU64Signaling", "readI53FromI64", "readI53FromU64",
    "convertI32PairToI53", "convertU32PairToI53", "reallyNegative", "unSign", "strLen", "reSign", "formatString", "getSocketFromFD", "getSocketAddress", "registerKeyEventCallback", "maybeCStringToJsString", "findEventTarget", "findCanvasEventTarget", "getBoundingClientRect", "fillMouseEventData", "registerMouseEventCallback", "registerWheelEventCallback", "registerUiEventCallback", "registerFocusEventCallback", "fillDeviceOrientationEventData", "registerDeviceOrientationEventCallback", "fillDeviceMotionEventData",
    "registerDeviceMotionEventCallback", "screenOrientation", "fillOrientationChangeEventData", "registerOrientationChangeEventCallback", "fillFullscreenChangeEventData", "registerFullscreenChangeEventCallback", "JSEvents_requestFullscreen", "JSEvents_resizeCanvasForFullscreen", "registerRestoreOldStyle", "hideEverythingExceptGivenElement", "restoreHiddenElements", "setLetterbox", "softFullscreenResizeWebGLRenderTarget", "doRequestFullscreen", "fillPointerlockChangeEventData", "registerPointerlockChangeEventCallback",
    "registerPointerlockErrorEventCallback", "requestPointerLock", "fillVisibilityChangeEventData", "registerVisibilityChangeEventCallback", "registerTouchEventCallback", "fillGamepadEventData", "registerGamepadEventCallback", "registerBeforeUnloadEventCallback", "fillBatteryEventData", "battery", "registerBatteryEventCallback", "setCanvasElementSize", "getCanvasElementSize", "checkWasiClock", "setImmediateWrapped", "clearImmediateWrapped", "polyfillSetImmediate", "exception_addRef", "exception_decRef",
    "_setNetworkCallback", "heapObjectForWebGLType", "heapAccessShiftForWebGLHeap", "emscriptenWebGLGet", "computeUnpackAlignedImageSize", "emscriptenWebGLGetTexPixelData", "emscriptenWebGLGetUniform", "webglGetUniformLocation", "webglPrepareUniformLocationsBeforeFirstUse", "webglGetLeftBracePos", "emscriptenWebGLGetVertexAttrib", "writeGLArray", "SDL_unicode", "SDL_ttfContext", "SDL_audio", "GLFW_Window", "runAndAbortIfError", "init_embind", "getBasestPointer", "registerInheritedInstance", "unregisterInheritedInstance",
    "getInheritedInstance", "getInheritedInstanceCount", "getLiveInheritedInstances", "requireRegisteredType", "enumReadValueFromPointer", "genericPointerToWireType", "constNoSmartPtrRawPointerToWireType", "nonConstNoSmartPtrRawPointerToWireType", "init_RegisteredPointer", "RegisteredPointer", "RegisteredPointer_getPointee", "RegisteredPointer_destructor", "RegisteredPointer_deleteObject", "RegisteredPointer_fromWireType", "runDestructor", "releaseClassHandle", "detachFinalizer", "attachFinalizer", "makeClassHandle",
    "init_ClassHandle", "ClassHandle", "ClassHandle_isAliasOf", "throwInstanceAlreadyDeleted", "ClassHandle_clone", "ClassHandle_delete", "ClassHandle_isDeleted", "ClassHandle_deleteLater", "flushPendingDeletes", "setDelayFunction", "RegisteredClass", "shallowCopyInternalPointer", "downcastPointer", "upcastPointer", "validateThis", "getStringOrSymbol", "craftEmvalAllocator", "emval_get_global", "emval_lookupTypes", "emval_allocateDestructors", "emval_addMethodCaller",];
missingLibrarySymbols.forEach(missingLibrarySymbol);
var calledRun;
dependenciesFulfilled = function runCaller() {
    if (!calledRun) {
        run();
    }
    if (!calledRun) {
        dependenciesFulfilled = runCaller;
    }
};
function callMain(args) {
    assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on Module["onRuntimeInitialized"])');
    assert(__ATPRERUN__.length == 0, "cannot call main when preRun functions remain to be called");
    var entryFunction = Module["_main"];
    var argc = 0;
    var argv = 0;
    try {
        var ret = entryFunction(argc, argv);
        exitJS(ret, true);
        return ret;
    } catch (e) {
        return handleException(e);
    }
}
function stackCheckInit() {
    _emscripten_stack_init();
    writeStackCookie();
}
function run(args) {
    args = args || arguments_;
    if (runDependencies > 0) {
        return;
    }
    stackCheckInit();
    preRun();
    if (runDependencies > 0) {
        return;
    }
    function doRun() {
        if (calledRun) {
            return;
        }
        calledRun = true;
        Module["calledRun"] = true;
        if (ABORT) {
            return;
        }
        initRuntime();
        preMain();
        if (Module["onRuntimeInitialized"]) {
            Module["onRuntimeInitialized"]();
        }
        if (shouldRunNow) {
            callMain(args);
        }
        postRun();
    }
    if (Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function () {
            setTimeout(function () {
                Module["setStatus"]("");
            }, 1);
            doRun();
        }, 1);
    } else {
        doRun();
    }
    checkStackCookie();
}
function checkUnflushedContent() {
    var oldOut = out;
    var oldErr = err;
    var has = false;
    out = err = function (x) {
        has = true;
    };
    try {
        _fflush(0);
        ["stdout", "stderr"].forEach(function (name) {
            var info = FS.analyzePath("/dev/" + name);
            if (!info) {
                return;
            }
            var stream = info.object;
            var rdev = stream.rdev;
            var tty = TTY.ttys[rdev];
            if (tty && tty.output && tty.output.length) {
                has = true;
            }
        });
    } catch (e) {
    }
    out = oldOut;
    err = oldErr;
    if (has) {
        warnOnce("stdio streams had content in them that was not flushed. you should set EXIT_RUNTIME to 1 (see the FAQ), or make sure to emit a newline when you printf etc.");
    }
}
if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function") {
        Module["preInit"] = [Module["preInit"]];
    }
    while (Module["preInit"].length > 0) {
        Module["preInit"].pop()();
    }
}
var shouldRunNow = true;
if (Module["noInitialRun"]) {
    shouldRunNow = false;
}
run();