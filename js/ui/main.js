"use strict";
var grid_client_browser_1 = require("grid-client-browser");
var implApi_1 = require("../implApi");
var implApiCore = grid_client_browser_1.GridClient.getSession().AutoScalerImplementationApiCore;
implApiCore.$M().subscribe("/", function (msg) {
});
var impl = implApi_1.getImplementation(implApiCore);
//impl.Setup.toJSON() 
