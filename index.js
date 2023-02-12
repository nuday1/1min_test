"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const fs_1 = require("fs");
const path_1 = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const FOLDERS = {
    PREROLL: "./preroll",
    INPUT: "./input",
    OUTPUT: "./output",
    TEMP: "./temp",
};
const ERRORS = {
    PREROLL: "Please add a preroll video to the preroll folder",
    INPUT: "Please add an input video to the input folder",
};
fluent_ffmpeg_1.default.setFfmpegPath(ffmpegPath);
fluent_ffmpeg_1.default.setFfprobePath(ffprobePath);
function isNil(obj) {
    return obj === null || typeof obj === "undefined";
}
function isEmpty(obj) {
    return obj === "" || isNil(obj);
}
function isObject(obj) {
    return obj != null && typeof obj === "object";
}
function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
}
function onError(err) {
    if (isObject(err)) {
        console.error(`Error: ${err.message}`, "\n");
    }
    else {
        console.error(err, "\n");
    }
    process.exitCode = 1;
}
function merge(prePath, inputPath) {
    return new Promise((resolve, reject) => {
        const inputName = (0, path_1.basename)(inputPath);
        (0, fluent_ffmpeg_1.default)(prePath)
            .input(inputPath)
            .on("error", reject)
            .on("start", () => {
            console.log(`Starting merge for ${inputName}`);
        })
            .on("end", () => {
            console.log(`${inputName} merged!`);
            resolve();
        })
            .mergeToFile((0, path_1.join)(FOLDERS.OUTPUT, inputName), FOLDERS.TEMP);
    });
}
function mergeAll() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const prerollFiles = yield fs_1.promises.readdir(FOLDERS.PREROLL);
            if (!isArray(prerollFiles) || prerollFiles.length === 0) {
                throw new Error(ERRORS.PREROLL);
            }
            let preroll;
            for (const p of prerollFiles) {
                const apPath = (0, path_1.join)(FOLDERS.PREROLL, p);
                const stat = yield fs_1.promises.stat(apPath);
                if (!stat.isDirectory()) {
                    preroll = apPath;
                    break;
                }
            }
            if (isEmpty(preroll)) {
                throw new Error(ERRORS.PREROLL);
            }
            const inputFiles = yield fs_1.promises.readdir(FOLDERS.INPUT);
            if (!isArray(inputFiles) || inputFiles.length === 0) {
                throw new Error(ERRORS.INPUT);
            }
            for (const i of inputFiles) {
                const iPath = (0, path_1.join)(FOLDERS.INPUT, i);
                const stat = yield fs_1.promises.stat(iPath);
                if (!stat.isDirectory()) {
                    yield merge(preroll, iPath);
                }
            }
        }
        catch (e) {
            onError(e);
        }
    });
}
mergeAll();
