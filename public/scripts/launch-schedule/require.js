// module-prelude.js
var require;

(function () {
  var hasOwnProperty = Object.hasOwnProperty;
  var currentModuleId = "";
  var modules = {};

  require = function (moduleId) {
    moduleId = resolveModuleId(moduleId,
                               currentModuleId);
    if (!hasOwnProperty.call(modules, moduleId)) {
      var message = "No such module " + moduleId;
      throw new ReferenceError(message);
    }
    var module = modules[moduleId];

    var exports = module.exports;
    if (!exports) {
      exports = module.exports = {};
      var body = module.body;
      delete module.body;

      var savedModuleId = currentModuleId;
      try {
        currentModuleId = moduleId;
        body(exports, {id: moduleId});
      } finally {
        currentModuleId = savedModuleId;
      }
    }

    return exports;
  }

  require.defineModule = function (moduleId, body) {
    modules[moduleId] = {body: body};
  }

  require.loadAllModules = function () {
    for (var moduleId in modules) {
      if (hasOwnProperty.call(modules, moduleId)) {
        require(moduleId);
      }
    }
  }

  // resolve relative module ids
  function resolveModuleId(moduleId, baseId) {
    moduleId = moduleId.split("/");
    var absModuleId;
    if (moduleId[0] === "." || moduleId[0] === "..") {
      absModuleId = baseId.split("/").slice(0, -1);
    } else {
      absModuleId = [];
    }

    for (var i = 0; i < moduleId.length; i++) {
      var component = moduleId[i];
      if (component === ".") {
        // ignore
      } else if (component === "..") {
        absModuleId.pop();
      } else {
        absModuleId.push(component);
      }
    }

    return absModuleId.join("/");
  }
})();
