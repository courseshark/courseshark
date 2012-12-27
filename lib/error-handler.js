var NotFound, bootErrorHandler, express,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

express = require('express');

exports.boot = function(app) {
  return bootErrorHandler(app);
};

NotFound = (function(_super) {
  __extends(NotFound, _super);
  NotFound.name = 'NotFound';
  function NotFound(path) {
    this.name = 'NotFound';
    this.message = path;
    Error.call(this, "Cannot find '" + path + "'");
    Error.captureStackTrace(this, arguments.callee);
  }
  return NotFound;
})(Error);

bootErrorHandler = function(app) {
  app.use(function(req, res, next) {
    return next(new NotFound(req.url));
  });
  app.use(function(err, req, res, next) {
    var errorInfo;
    errorInfo = {
      status: 500,
      error: err,
      showStack: app.settings.showStackError,
      title: 'Oops! Something went wrong!'
    };
    console.log(err.stack);
    if (err instanceof NotFound) {
      errorInfo.title = 'Oops! The page you requested desn\'t exist';
      errorInfo.status = 404;
      return res.render('errors/index', errorInfo);
    } else {
      return res.render('errors/index', errorInfo);
    }
  });
};
