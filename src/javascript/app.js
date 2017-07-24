Ext.define("gherkin-helper", {
      extend: 'Rally.app.App',
      componentCls: 'app',
      logger: new Rally.technicalservices.Logger(),

      config: {
        defaultSettings: {
          gherkinField: 'Notes',
          gherkinRegex: "(scenario outline:.*)(given:.*)(when:.*)(then:.*)"
        }
      },

      modelNames: ['userstory'],
      requiredGherkinFields: ['Description','Name','FormattedID'],

      launch: function() {
          //this._buildArtifactBox();
          this._addGridboard();
       },

       _addGridboard: function(){

         if (!this.rendered){
            this.on('render', this._addGridboard, this);
            return;
         }
         this.removeAll();
         var modelNames = this.getModelNames(),
            gherkinField = this.getGherkinField(),
            gherkinRegexp = this.getGherkinRegexp();

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
                          stateful: true,
                          stateId: this.getContext().getScopedStateId('gherkin-filter'),
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
         return "(scenario outline:.*)(given:.*)(when:.*)(then:.*)";
       },
       getRequiredFetchFields: function(){
         var fields = this.requiredGherkinFields;
         fields.push(this.getGherkinField());
         this.logger.log('getRequiredFetchFields', fields);
         return fields ;
       },
       getSettingsFields: function(){
          return [{
              xtype: 'rallyfieldcombobox',
              model: 'HierarchicalRequirement',
              name: 'gherkinField',
              fieldLabel: 'Acceptance Criteria Field',
              labelWidth: 150,
              labelAlign: 'right',
              listeners: {
                ready: function(combo) {
                    combo.store.filterBy(function(record) {
                        var attr = record.get('fieldDefinition').attributeDefinition;
                        return attr && !attr.ReadOnly && attr.AttributeType === "TEXT";
                    });
              }}
          }];
       }
  });
