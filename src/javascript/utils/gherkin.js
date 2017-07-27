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

            var pred = _.every(records, function (record) {
                var gherkin = record.get(gherkinField),
                    re = new RegExp(gherkinRegexp,"gim");

                if (gherkin){
                  //Only return items with the right format in the field
                  return re.test(gherkin);
                }
                return false;
            });

            return pred;
        },

        handler: function () {

          var gherkinFiles = [];
          Ext.Array.each(this.records, function(r){
               var gherkinFile = Ext.create('CA.agile.technicalservices.GherkinFile', {
                 data: r.getData(),
                 gherkinField: this.gherkinField,
                 tagsField: this.tagsField
               });
               gherkinFile.export();
          }, this);
          this.onSuccess(this.records,[],null,null);
        },
        _scrubText: function(val){
            //Todo strip html
            var reHTML = new RegExp('<\/?[^>]+>', 'g'),
                reNbsp = new RegExp('&nbsp;','ig');

            if (reHTML.test(val)){
              console.log('html', val);
                val = val.replace(/<br.*>/g,'\r\n');
                val = val.replace(/<\/div><div>/g,'\r\n');
                val = Ext.util.Format.htmlDecode(val);
                val = Ext.util.Format.stripTags(val);
                //console.log('stripped html val', val);
            }
            if (reNbsp.test(val)){
                val = val.replace(reNbsp,' ');
            }
            return val;
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
