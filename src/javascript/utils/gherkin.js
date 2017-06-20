Ext.define('CA.agile.technicalservices.utils.bulkmenu.ExportGherkin', {
    alias: 'widget.exportgherkin',
    extend: 'Rally.ui.menu.bulk.MenuItem',

    config: {
        text: 'Export Gherkin...',
        gherkinField: null,
        gherkinRegexp: '',

        predicate: function (records) {
            var gherkinField = this.gherkinField,
                gherkinRegexp = this.gherkinRegexp;

            if (!gherkinField){ return false; }
            return _.every(records, function (record) {
                var gherkin = record.get(gherkinField);
                if (gherkin){
                  //Only return items with the right format in the field
                  return gherkinRegexp.test(gherkin);
                }
                return false;
                return gherkin && gherkin;
            });
        },

        handler: function () {

          var gherkinFiles = [];
          Ext.Array.each(this.records, function(r){
               var gherkinFile = Ext.create('CA.agile.technicalservices.GherkinFile', {
                 data: r.getData(),
                 gherkinField: this.gherkinField
               });
               gherkinFile.export();
               //gherkinFiles.push(gherkinFile.getText());
          }, this);

        },
        onSuccess: function (successfulRecords, unsuccessfulRecords, args, errorMessage) {

            var message = successfulRecords.length + (successfulRecords.length === 1 ? ' gherkin has been exported' : ' gherkins have been exported');

            if(successfulRecords.length === this.records.length) {
                Rally.ui.notify.Notifier.show({
                    message: message + '.'
                });
            } else {
                Rally.ui.notify.Notifier.showWarning({
                    message: message + ', but ' + unsuccessfulRecords.length + ' failed: ' + errorMessage
                });
            }

            Ext.callback(this.onActionComplete, null, [successfulRecords, unsuccessfulRecords]);
        }
    }
});
