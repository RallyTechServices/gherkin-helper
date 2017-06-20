describe("Example test set", function() {
  it("should be able to parse scenarios",function(){
      expect(true).toBe(true);
      expect(Ext.Date.format(new Date(),'Y')).toEqual('2017');
  });

  it('should render the app', function() {
      var app = Rally.test.Harness.launchApp("gherkin-helper");
      expect(app.getEl()).toBeDefined();
  });

});
