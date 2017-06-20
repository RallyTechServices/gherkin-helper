Ext.define('CA.agile.technicalservices.GherkinFile',{

  maxCharsPerLine: 100,

  constructor: function(config){
     this.data = config.data,
     this.gherkinField = config.gherkinField;
  },
  getText: function(){

    var idx = 1,
        txt = [
          Ext.String.format("{2}. Feature: {0} {1}", this.data.FormattedID, this.data.Name, idx++)
        ];
        if (this.data.Description && this.data.Description.length > 0){
          txt.push(Ext.String.format("{0}.  {1}", idx++, this.data.Description)); //TODO format better
        }
        txt.push(Ext.String.format("{0}.", idx++));

        var rawGherkin = this.data[this.gherkinField];
        var re = new RegExp(/scenario:/,"gi"),
          reScenario = new RegExp(/(.*)(given:.*)(when:.*)(then:.*)/,"gim"), //TODO does not account for multiple givens or thens or whens
          rawScenarios = rawGherkin.split(re);

         Ext.Array.each(rawScenarios, function(sc){

           if (sc && sc.length > 0){

             var match = reScenario.exec(sc);

             if (match && match.length > 0){
               //TODO Strip out HTML
               txt.push(Ext.String.format("{0}.  Scenario: {1}",idx++, match[1]));
               for (var i=2; i<match.length; i++){
                 txt.push(Ext.String.format("{0}.   {1}",idx++, this._scrubText(match[i])));
               }

             }

           }

         }, this);
         return txt.join('\r\n');
    },
    _scrubText: function(txt){
        //Todo strip html
        return txt.replace(/&nbsp;/g,'');
    },
    print: function(){
      this.win = window.open('',this.title);

      var title = this.data.FormattedID + " Feature File",
          text = this.getText();

      this.win.document.write('<html><head><title>' + title + '</title>');
      this.win.document.write('</head><body class="portrait">');
      this.win.document.write(text);
      this.win.document.write('</body></html>');
  },
  export: function(){
     var fileName = this.data.FormattedID + ".feature",
        txt = this.getText();

     this.saveAs(txt,fileName);
  },
  saveAs: function(textToWrite, fileName, typeObject)
  {
      if (typeObject === undefined){
          typeObject = {type:'text/csv;charset=utf-8'};
      }

      if (Ext.isIE9m){
          Rally.ui.notify.Notifier.showWarning({message: "Export is not supported for IE9 and below."});
          return;
      }

      var textFileAsBlob = null;
      try {
          textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
      }
      catch(e){
          window.BlobBuilder = window.BlobBuilder ||
              window.WebKitBlobBuilder ||
              window.MozBlobBuilder ||
              window.MSBlobBuilder;
          if (window.BlobBuilder && e.name == 'TypeError'){
              bb = new BlobBuilder();
              bb.append([textToWrite]);
              textFileAsBlob = bb.getBlob("text/plain");
          }

      }

      if (!textFileAsBlob){
          Rally.ui.notify.Notifier.showWarning({message: "Export is not supported for this browser."});
          return;
      }

      var fileNameToSaveAs = fileName;

      if (Ext.isIE10p){
          window.navigator.msSaveOrOpenBlob(textFileAsBlob,fileNameToSaveAs); // Now the user will have the option of clicking the Save button and the Open button.
          return;
      }

      var url = this.createObjectURL(textFileAsBlob);

      if (url){
          var downloadLink = document.createElement("a");
          if ("download" in downloadLink){
              downloadLink.download = fileNameToSaveAs;
          } else {
              //Open the file in a new tab
              downloadLink.target = "_blank";
          }

          downloadLink.innerHTML = "Download File";
          downloadLink.href = url;
          if (!Ext.isChrome){
              // Firefox requires the link to be added to the DOM
              // before it can be clicked.
              downloadLink.onclick = this.destroyClickedElement;
              downloadLink.style.display = "none";
              document.body.appendChild(downloadLink);
          }
          downloadLink.click();
      } else {
          Rally.ui.notify.Notifier.showError({message: "Export is not supported "});
      }

  },
  createObjectURL: function ( file ) {
      if ( window.webkitURL ) {
          return window.webkitURL.createObjectURL( file );
      } else if ( window.URL && window.URL.createObjectURL ) {
          return window.URL.createObjectURL( file );
      } else {
          return null;
      }
  },
  destroyClickedElement: function(event)
  {
      document.body.removeChild(event.target);
  }

});
