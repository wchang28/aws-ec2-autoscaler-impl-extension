"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestData = (function () {
    function RequestData(req) {
        this.req = req;
    }
    Object.defineProperty(RequestData.prototype, "Global", {
        get: function () { return this.req.app.get("global"); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RequestData.prototype, "Implementation", {
        get: function () { return this.Global.implementation; },
        enumerable: true,
        configurable: true
    });
    return RequestData;
}());
exports.RequestData = RequestData;
function getReqestHandler(handler) {
    return function (req, res) {
        var rd = new RequestData(req);
        handler(rd.Implementation, req)
            .then(function (value) {
            res.jsonp(value);
        }).catch(function (err) {
            res.status(400).json(err);
        });
    };
}
exports.getReqestHandler = getReqestHandler;
