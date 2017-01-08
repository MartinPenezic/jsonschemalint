describe('Validator', function() {
  var $compile,
      $rootScope,
      $scope;

  // Load the app module, which contains the component
  beforeEach(module('app'));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
  }));

  it('mounts the component', function() {
    var element = $compile("<validator></validator>")($scope);
    $rootScope.$digest();

    // Must have compiled and inserted a scope properly - check that $scope has a child scope
    expect($scope.$$childHead.$ctrl).to.be.ok;
  });

  it('accepts a validation function', function() {
    $scope.echo = function(a) {
      return a;
    };

    var element = $compile("<validator validator=\"echo\"></validator>")($scope);
    $rootScope.$digest();

    var $ctrl = $scope.$$childHead.$ctrl;

    expect($ctrl).to.be.ok;
    expect($ctrl.validator).to.be.a.function;
    expect($ctrl.validator("foo")).to.eql("foo");
  });

  it('accepts a parse function', function() {
    $scope.echo = function(a) {
      return a;
    };

    var element = $compile("<validator parser=\"echo\"></validator>")($scope);
    $rootScope.$digest();

    var $ctrl = $scope.$$childHead.$ctrl;

    expect($ctrl).to.be.ok;
    expect($ctrl.parser).to.be.a.function;
    expect($ctrl.parser("foo")).to.eql("foo");
  });

  it('contains a form with a document text area', function() {
    var element = $compile("<validator></validator>")($scope);
    $rootScope.$digest();

    expect(element[0].querySelector("form textarea.validator-document")).not.to.be.empty;
  });

  it('binds its document textarea to its document model', function() {
    var element = $compile("<validator></validator>")($scope);
    $rootScope.$digest();

    var $ctrl = $scope.$$childHead.$ctrl;
    $ctrl.document = "foo";
    $rootScope.$digest();

    var textarea = element[0].querySelector("form textarea.validator-document");
    expect(textarea.value).to.eql("foo");
  });

});