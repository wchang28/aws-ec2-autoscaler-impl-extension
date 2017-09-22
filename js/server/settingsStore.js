"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var SettingsStore = /** @class */ (function () {
    function SettingsStore(settingsFile) {
        this.settingsFile = settingsFile;
    }
    SettingsStore.prototype.load = function () { return Promise.resolve(JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'))); };
    SettingsStore.prototype.save = function (settings) { return Promise.resolve(fs.writeFileSync(this.settingsFile, JSON.stringify(settings, null, 2), 'utf8')); };
    return SettingsStore;
}());
exports.SettingsStore = SettingsStore;
