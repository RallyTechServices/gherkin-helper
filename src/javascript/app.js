Ext.define("gherkin-helper", {
      extend: 'Rally.app.App',
      componentCls: 'app',
      logger: new Rally.technicalservices.Logger(),

      config: {
        defaultSettings: {
          gherkinField: 'Notes',
          gherkinRegex: "(.*)(given:.*)(when:.*)(then:.*)"
        }
      },

      modelNames: ['userstory'],
      requiredGherkinFields: ['Description','Name','FormattedID'],

      launch: function() {
          //this._buildArtifactBox();
          this._addGridboard();
       },

       _addGridboard: function(){

         this.removeAll();
         var modelNames = this.getModelNames();

         Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
               models: modelNames,
               autoLoad: true,
               enableHierarchy: false,
               fetch: this.getRequiredFetchFields()
           }).then({
               success: function(store) {
                   this.add({
                     xtype: 'rallygridboard',
                     context: this.getContext(),
                     modelNames: modelNames,
                     toggleState: 'grid',
                     plugins: [{
                       ptype: 'rallygridboardinlinefiltercontrol',
                       inlineFilterButtonConfig: {
                           modelNames: modelNames,
                           inlineFilterPanelConfig: {
                               collapsed: false,
                               quickFilterPanelConfig: {
                                   fieldNames: ['Owner', 'ScheduleState']
                               }
                           }
                       }
                     },{
                        ptype: 'rallygridboardfieldpicker',
                        headerPosition: 'left',
                        modelNames: ['User Story'],
                        stateful: true,
                        stateId: this.getContext().getScopedStateId('gherkin-cols')
                    }],
                     gridConfig: {
                         store: store,
                         columnCfgs: [
                             'Name',
                             'ScheduleState'
                         ],
                         bulkEditConfig: {
                             items: [{
                                 xtype: 'exportgherkin',
                                 gherkinField: this.getGherkinField(),
                                 gherkinRegexp: this.getGherkinRegexp()

                             }]
                         },
                     },
                     height: this.getHeight()
                   });
                 },
                 scope: this
           });

       },
       getModelNames: function(){
         return this.modelNames;
       },
       getGherkinField: function(){
         return this.getSetting('gherkinField');
       },
       getGherkinRegexp: function(){
         return new RegExp(/(.*)(given:.*)(when:.*)(then:.*)/, "gim");
       },
       getRequiredFetchFields: function(){
         var fields = this.requiredGherkinFields;
         fields.push(this.getGherkinField());
         this.logger.log('getRequiredFetchFields', fields);
         return fields ;
       },
  });
