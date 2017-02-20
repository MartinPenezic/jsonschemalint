'use strict';

var app = angular.module('app', false);

// Handles draft-01, draft-02, draft-03
app.factory('validatorFactoryJSV', function ($window, $q, alertService, $log) {

  var Validator = function (version) {
    // Initially unset for lazy-loading
    var validator;
    var schemaSchema;

    var _setupPromise;
    var setup = function () {
      // We wrap this in $q otherwise the digest doesn't fire correctly
      return _setupPromise || (_setupPromise = $q.when(require('async-module-loader?promise!JSV')).then(function (JSV) {
        var jsv = JSV.JSV;
        //
        // VERSION DETERMINATION LOGIC
        //
        validator = jsv.createEnvironment("json-schema-" + version);
        schemaSchema = validator.getDefaultSchema();
        return true;
      }).catch(function (error) {
        $log.error("ValidatorFactoryJSV.setup()", "Could not load JSV", error);
        alertService.alert({
          title: "Could not load module",
          message: "We couldn't load a vital part of the application.  This is probably due to network conditions.  We recommend reloading the page once conditions improve."
        });
        throw error;
      }));
    };

    // Convert JSV errors into something the tables understand
    var mapError = function (e) {
      var field = e.uri.substring(e.uri.indexOf('#') + 1);
      return {
        dataPath: field,
        message: e.message,
        data: e.details.length ? e.details[0] : ""
      };
    };

    this.validateSchema = function (schemaObject) {
      $log.debug("ValidatorFactoryJSV.validateSchema()");
      return setup().then(angular.bind(this, function () {
        var results = validator.validate(schemaObject, schemaSchema);
        if (!results.errors || !results.errors.length) {
          $log.debug("ValidatorFactoryJSV.validateSchema()", "success");
          return true;
        } else {
          $log.debug("ValidatorFactoryJSV.validateSchema()", "failure", results.errors);
          throw results.errors.map(mapError);
        }
      }));
    };

    this.validate = function (schemaObject, documentObject) {
      $log.debug("ValidatorFactoryJSV.validate()");
      return setup().then(angular.bind(this, function () {
        var results = validator.validate(documentObject, schemaObject);
        if (!results.errors || !results.errors.length) {
          $log.debug("ValidatorFactoryJSV.validate()", "success");
          return true;
        } else {
          $log.debug("ValidatorFactoryJSV.validate()", "failure", results.errors);
          throw results.errors.map(mapError);
        }
      }));
    };
  };

  // Factory for JSV validators
  return function (version) {
    return new Validator(version);
  };

});