'use strict';

var EC = protractor.ExpectedConditions;

describe('jsonschemalint', function() {

  it('should automatically redirect to a default version & markup when location hash/fragment is empty', function() {
    browser.get('index.html');
    expect(browser.getCurrentUrl()).toMatch("/version/.*/markup/.*");
  });

  describe('about dialog', function() {
    it('should display when the button is clicked', function() {
      browser.get('index.html');

      element(by.linkText("About")).click();

      expect(element(by.cssContainingText('h3', 'About')).isDisplayed()).toBeTruthy();
    });
  });

  var sampleTestMatrix = [
    // Validating in draft-03 mode should force JSV to get loaded - the draft-04 samples (because they're simple) should be OK
    { mode: 'draft-03', sample: 'Sample draft-04 schema and valid document', schemaValid: true, documentValid: true },
    { mode: 'draft-03', sample: 'Sample draft-04 schema and invalid document', schemaValid: true, documentValid: false },
    // Validating in draft-04 mode should force Ajv to get loaded
    { mode: 'draft-04', sample: 'Sample draft-04 schema and valid document', schemaValid: true, documentValid: true },
    { mode: 'draft-04', sample: 'Sample draft-04 schema and invalid document', schemaValid: true, documentValid: false },
    // v5-unofficial because we can
    { mode: 'v5-unofficial', sample: 'Sample v5-unofficial schema and valid document', schemaValid: true, documentValid: true },
    { mode: 'v5-unofficial', sample: 'Sample v5-unofficial schema and invalid document', schemaValid: true, documentValid: false }
  ];
  var markupSampleTests = function(markup) {
    sampleTestMatrix.forEach(({mode, sample, schemaValid, documentValid}) => {
      it('in ' + mode + ' mode, should correctly validate the ' + sample, function() {
        browser.get('#/version/' + mode + '/markup/' + markup);

        // Open the samples menu
        element(by.buttonText("Samples")).click();
        // SUSPICION - the samples menu displays outside angular's digest cycle.  So protractor doesn't really know if it's there
        browser.wait(EC.visibilityOf(element(by.css("ul[aria-labelledby=sampleDropdown]"))), 250);

        // Click the sample to load it
        element(by.linkText(sample)).click();
        // Wait for the validation processes to finish (samples to be loaded, any chunks to come in, etc.)
        browser.wait(function() {
          return element.all(by.css('validator > div')).evaluate('$ctrl.working').then(function(workingArr) {
            return workingArr.indexOf(true) === -1;
          });
        }, 2500);

        // Schema is valid/invalid
        expect(element(by.css("validator[identifier=schema] .panel.panel-" + (schemaValid ? 'success' : 'danger') )).isDisplayed()).toBeTruthy();
        // Document is valid/invalid
        expect(element(by.css("validator[identifier=document] .panel.panel-" + (documentValid ? 'success' : 'danger') )).isDisplayed()).toBeTruthy();
      });
    });
  };

  describe('JSON samples', function() {
    markupSampleTests("json");
  });

  describe('YAML samples', function() {
    markupSampleTests("yaml");
  });

});