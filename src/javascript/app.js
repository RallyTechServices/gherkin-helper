Ext.define("gherkin-helper", {
      extend: 'Rally.app.App',
      componentCls: 'app',
      logger: new Rally.technicalservices.Logger(),

      config: {
        defaultSettings: {
          gherkinField: 'Notes',
          tagsField: null,
          gherkinRegex: "(scenario outline:.*)(given:.*)(when:.*)(then:.*)",
          strictFormatGherkin: false
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
                                 gherkinRegexp: this.getGherkinRegexp(),
                                 tagsField: this.getSetting('tagsField')
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
         if (this.getSetting('strictFormatGherkin') === 'true' || this.getSetting('strictFormatGherkin') === true){
           return "(scenario outline:.*)(given:.*)(when:.*)(then:.*)";
         }
         return ".*";

       },
       getRequiredFetchFields: function(){
         var fields = this.requiredGherkinFields;
         fields.push(this.getGherkinField());
         if (this.getSetting('tagsField')){
            fields.push(this.getSetting('tagsField'));
         }
         this.logger.log('getRequiredFetchFields', fields);
         return fields ;
       },
       getSettingsFields: function(){
         var tagField = this.getSetting('tagsField') || null;

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
          },{
              xtype: 'rallyfieldcombobox',
              model: 'HierarchicalRequirement',
              name: 'tagsField',
              fieldLabel: 'Gherkin Tags Field',
              labelWidth: 150,
              labelAlign: 'right',
              allowBlank: true,
              allowNoEntry: true,
              noEntryText: '-- No Tag Field --',
              emptyText: '-- No Tag Field --',
              listeners: {
                ready: function(combo) {
                    combo.store.filterBy(function(record) {
                        var attr = record.get('fieldDefinition').attributeDefinition;
                        return attr && !attr.ReadOnly && attr.AttributeType === "COLLECTION" && attr.Constrained === true && attr.Custom === true;
                    });
                    this.setValue(tagField);
              }}
          }];
       }
  });
