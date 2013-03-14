exports = module.exports = function(app, redis) {
  app.use(function(req, res, next) {
    var ua;
    ua = req.sessionID;
    return redis.zadd('online', Date.now(), ua, next);
  });
  return app.use(function(req, res, next) {
    var ago, min;
    min = 2 * 60 * 1000;
    ago = Date.now() - min;
    redis.zrevrangebyscore('online', '+inf', ago, function(err, users) {
      if (err) {
        return next(err);
      }
      req.online = users.length;
      return next();
    });
    return redis.zremrangebyscore('online', '-inf', "(" + ago, function(err, users) {});
  });
};
