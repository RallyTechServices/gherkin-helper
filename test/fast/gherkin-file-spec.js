describe("Gherkin File Class", function() {

  var storyData = {
       FormattedID: "US1",
       Name: "Make the road better",
       Description: "People will drive on a nice road.",
       Notes: "Scenario no potholes in the road given: a smooth road when: driving on it then: it shouldn't be bumpy"
  }

  var gherkinFile = Ext.create('CA.agile.technicalservices.GherkinFile',{
      data: storyData,
      gherkinField: 'Notes'
  })

  it('should return the expected text', function() {
      expect(gherkinFile.getText()).toBe("");
  });

});
