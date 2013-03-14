module.exports = exports = function (d) {
  function f(a, b) {
    for(var c = 0;b;) {
      c = 2 * c + a % 2, a /= 2, a -= a % 1, b--
    }
    return c
  }
  var d = String(d), h = 2 > arguments.length ? 79764919 : arguments[1], i = 4 > arguments.length ? 4294967295 : arguments[3], e = 3 > arguments.length ? 4294967295 : arguments[2], g = [], a, c, b;
  for(a = 255;0 <= a;a--) {
    b = f(a, 32);
    for(c = 0;8 > c;c++) {
      b = (2 * b ^ (b >>> 31) % 2 * h) >>> 0
    }
    g[a] = f(b, 32)
  }
  for(a = 0;a < d.length;a++) {
    b = d.charCodeAt(a);
    if(255 < b) {
      throw new RangeError;
    }
    c = e % 256 ^ b;
    e = (e / 256 ^ g[c]) >>> 0
  }
  return(e ^ i) >>> 0
};