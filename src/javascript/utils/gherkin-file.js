Ext.define('CA.agile.technicalservices.GherkinFile',{

  maxCharsPerLine: 100,

  constructor: function(config){
     this.data = config.data,
     this.gherkinField = config.gherkinField;
     this.strictFormatGherkin = config.strictFormatGherkin;
     this.tagsField = config.tagsField;
  },
  getText: function(){

    var idx = 1,
        txt = [Ext.String.format("@{0}",this.data.FormattedID)];

        var tagsFieldValue = this.tagsField && this.data[this.tagsField];
        if (tagsFieldValue && tagsFieldValue.Count > 0){
          Ext.Array.each(tagsFieldValue._tagsNameArray || [], function(t){
             if (t.Name){
               txt.push(Ext.String.format("@{0}",t.Name));
             }
          });
        }

        txt.push(Ext.String.format("Feature: {0}", this.data.Name));

        if (this.data.Description && this.data.Description.length > 0){
          txt.push(Ext.String.format("\t{0}", this._scrubText(this.data.Description))); //TODO format better
        }
        txt.push("\r\n");

        var rawGherkin = this._scrubText(this.data[this.gherkinField]);

        if (!this.strictFormatGherkin){
          txt.push(rawGherkin);
          return txt.join('\r\n');
        }

        //This was for more strict formatting of the gherkin file.
        var re = new RegExp(/scenario outline:|given:|when:|then:|examples:/,"gim");

        gherkinBits = rawGherkin.split(re);
        gherkinOrder = [];
        while ((bits = re.exec(rawGherkin)) !== null) {
          gherkinOrder.push(bits[0]);
        }

        var reScenario = new RegExp(/scenario outline:/,"gim"),
          reAndOr = new RegExp(/and|or/,"gim");  //we ignore the first one in the bits

        for (var i=0; i<gherkinOrder.length; i++){
          var keyword = this._toCamelCase(gherkinOrder[i]),
              bit = gherkinBits[i+1],
              prefix = "\t";

          if (!reScenario.test(gherkinOrder[i])){ //this is a given, when, then or example
             prefix = "\t\t";
          }

          andOrBits = bit.split(reAndOr);
          andOrOrder = [];
          while ((bits = reAndOr.exec(bit)) !== null) {
            andOrOrder.push(bits[0]);
          }
          console.log('bit', andOrBits, andOrOrder);
          //txt.push(Ext.String.format("{0}{1} {2}\r\n",prefix,keyword, bit));

          txt.push(Ext.String.format("{0}{1}{2}\r\n",prefix, keyword, andOrBits[0]));
          for (var j=1; j<andOrBits.length; j++){
             txt.push(Ext.String.format("{0}\t{1}{2}\r\n",prefix,this._toCamelCase(andOrOrder[j-1]),andOrBits[j]));
          }

        }
         return txt.join('\r\n');
    },
    _scrubText: function(val){
        //Todo strip html
        var reHTML = new RegExp('<\/?[^>]+>', 'g'),
            reNbsp = new RegExp('&nbsp;','ig');

        if (reHTML.test(val)){
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
    _toCamelCase: function(str){
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
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
