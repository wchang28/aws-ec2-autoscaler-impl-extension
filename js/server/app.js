"use strict";
var express_web_server_1 = require("express-web-server");
var express = require("express");
var bodyParser = require("body-parser");
var noCache = require("no-cache-express");
var prettyPrinter = require("express-pretty-print");
var aws_ec2_autoscaler_impl_1 = require("aws-ec2-autoscaler-impl");
var fs = require("fs");
var settingsStore_1 = require("./settingsStore");
var services_1 = require("./services");
var utils_1 = require("../utils");
if (process.argv.length < 3) {
    console.error("config file is missiing");
    process.exit(1);
}
var configFile = process.argv[2];
var config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
var store = new settingsStore_1.SettingsStore(config.settingsFile);
store.load()
    .then(function (options) {
    console.log("settings loaded successfully. settings=");
    console.log(JSON.stringify(options, null, 2));
    console.log("");
    var app = express();
    app.use(noCache);
    app.use(bodyParser.json({ "limit": "999mb" }));
    app.use(prettyPrinter.get());
    app.set('jsonp callback name', 'cb');
    var implementation = new aws_ec2_autoscaler_impl_1.Implementation(config.implementationInfo, function (worker) { return worker.RemoteAddress; }, function (instance) { return (instance ? instance.PrivateIpAddress : null); }, function (instance, workerKey) { return (instance ? instance.PrivateIpAddress === workerKey : false); }, options);
    implementation.on('change', function () {
        var msg = { type: "change", content: null };
        services_1.ConnectionsManager.dispatchMessage(utils_1.Utils.getImplementationSetupTopic(), {}, msg);
        store.save(implementation.toJSON())
            .then(function () { }).catch(function (err) {
            console.error("!!! Error saving settings: " + JSON.stringify(err));
        });
    });
    var g = { implementation: implementation };
    app.set("global", g);
    app.use('/services', services_1.Router);
    express_web_server_1.startServer(config.webServerConfig, app, function (secure, host, port) {
        console.log('aws ec2 auto-scaler impl. service listening at %s://%s:%s', (secure ? 'https' : 'http'), host, port);
    });
}).catch(function (err) {
    console.error("!! Error loading settings: " + JSON.stringify(err));
    process.exit(1);
});
