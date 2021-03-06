/**
 * Execute the user's code.
 * Just a quick and dirty eval.  No checks for infinite loops, etc.
 */
function runJS() {
  var code = Blockly.Generator.workspaceToCode('JavaScript');
  try {
    eval(code);
  } catch (e) {
    alert('Program error:\n' + e);
  }
}

/**
 * Backup code blocks to localStorage.
 */
function backup_blocks() {
  if ('localStorage' in window) {
     
    var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
    window.localStorage.setItem('arduino', Blockly.Xml.domToText(xml));
  }
}

/**
 * Restore code blocks from localStorage.
 */
function restore_blocks() {

  if ('localStorage' in window && window.localStorage.arduino) {
    var xml = Blockly.Xml.textToDom(window.localStorage.arduino);
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
  }
}

/**
* Save Arduino generated code to local file.
*/
function saveCode() {
    
 //ADEL
 var badBlock = Blockly.Arduino.getUnconnectedBlock();
    //alert(badBlock);
    if (badBlock) {
      warningText = MSG['warningBadBlock'];
      
    } else {
      badBlock = Blockly.Arduino.getBlockWithWarning();
      if (badBlock) {
       warningText = MSG['warningPleaseFix'];
      }
   }
   

    if (badBlock) {
      // Go to blocks pane.
      //Code.displayTab('tab_blocks');
      
      Code.selected = 'blocks';
      clickedName = 'blocks';
      
      // Pop up warning dialog, making an offending block blink.
      // If they close the dialog with "OK", they remain in the blocks pane.
      // If they choose the other option ("generate Lua anyway"), the fake
      // tab "tab_lua!" is selected, and this validation will get skipped.
      var style = {
        left: '25%',
        top: '5em'
      };
      
      document.getElementById('badBlockMsg').innerHTML = warningText;
      BlocklyApps.showDialog(document.getElementById('badBlockDiv'), null,
                             false, true, style, BlocklyApps.stopDialogKeyDown);
      BlocklyApps.startDialogKeyDown();
     
      var blink = function() {
        badBlock.select();
        if (BlocklyApps.isDialogVisible_) {
          window.setTimeout(function() {badBlock.unselect();}, 150);
          window.setTimeout(blink, 300);
        }
      };
      blink();
      return;
    
    }
 //
  var d = new Date();
  var fileName = window.prompt('What would you like to name your file?', 'BlocklyDuino_MRTDuino_'+'_'+d.getMinutes()+d.getMilliseconds())
  //doesn't save if the user quits the save prompt
  if(fileName){
    var blob = new Blob([Blockly.Arduino.workspaceToCode()], {type: 'text/ino;charset=utf-8'});
    saveAs(blob, fileName + '.ino');
  }
}

/**
 * Save blocks to local file.
 * better include Blob and FileSaver for browser compatibility
 */
function save() {
  var xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
  var data = Blockly.Xml.domToText(xml);
  var fileName = window.prompt('What would you like to name your file?', 'BlocklyDuino');
  // Store data in blob.
  // var builder = new BlobBuilder();
  // builder.append(data);
  // saveAs(builder.getBlob('text/plain;charset=utf-8'), 'blockduino.xml');
  if(fileName){
    var blob = new Blob([data], {type: 'text/xml'});
    saveAs(blob, fileName + ".xml");
  } 
}

/**
 * Load blocks from local file.
 * 
 * 
 */


function load(event) {
    //ADDEL
    //var fileName = window.prompt('§PPPP?', 'BlocklyDuino');
   
  var files = event.target.files;

  // Only allow uploading one file.
  if (files.length != 1) {
    return;
  }

  // FileReader
  var reader = new FileReader();
  reader.onloadend = function(event) {
    var target = event.target;
    // 2 == FileReader.DONE
    if (target.readyState == 2) {
      try {
        var xml = Blockly.Xml.textToDom(target.result);
      } catch (e) {
        alert('Error parsing XML:\n' + e);
        return;
      }
      var count = Blockly.mainWorkspace.getAllBlocks().length;
      if (count && confirm('Replace existing blocks?\n"Cancel" will merge.')) {
        Blockly.mainWorkspace.clear();
      }
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
    }
    // Reset value of input after loading because Chrome will not fire
    // a 'change' event if the same file is loaded again.
    document.getElementById('load').value = '';
  };
  reader.readAsText(files[0]);
}

/**
 * Discard all blocks from the workspace.
 */
function discard() {
  var count = Blockly.mainWorkspace.getAllBlocks().length;
  if (count < 2 || window.confirm('Delete all ' + count + ' blocks?')) {
    Blockly.mainWorkspace.clear();
    renderContent();
  }
}

/*
 * auto save and restore blocks
 */
function auto_save_and_restore_blocks() {
  // Restore saved blocks in a separate thread so that subsequent
  // initialization is not affected from a failed load.
  window.setTimeout(restore_blocks, 0);
  // Hook a save function onto unload.
  bindEvent(window, 'unload', backup_blocks);
  Code.tabClick(selected);

  // Init load event.
  var loadInput = document.getElementById('load');
  loadInput.addEventListener('change', load, false);
  document.getElementById('fakeload').onclick = function() {
    loadInput.click();
  };
}

/**
 * Bind an event to a function call.
 * @param {!Element} element Element upon which to listen.
 * @param {string} name Event name to listen to (e.g. 'mousedown').
 * @param {!Function} func Function to call when event is triggered.
 *     W3 browsers will call the function with the event object as a parameter,
 *     MSIE will not.
 */
function bindEvent(element, name, func) {
  if (element.addEventListener) {  // W3C
    element.addEventListener(name, func, false);
  } else if (element.attachEvent) {  // IE
    element.attachEvent('on' + name, func);
  }
}

//loading examples via ajax
var ajax;
function createAJAX() {
  if (window.ActiveXObject) { //IE
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e2) {
        return null;
      }
    }
  } else if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else {
    return null;
  }
}

function onSuccess() {
  if (ajax.readyState == 4) {
    if (ajax.status == 200) {
      try {
      var xml = Blockly.Xml.textToDom(ajax.responseText);
      } catch (e) {
        alert('Error parsing XML:\n' + e);
        return;
      }
      var count = Blockly.mainWorkspace.getAllBlocks().length;
      if (count && confirm('Replace existing blocks?\n"Cancel" will merge.')) {
        Blockly.mainWorkspace.clear();
      }
      Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xml);
    } else {
      alert("Server error");
    }
  }
}

function load_by_url(uri) {
  ajax = createAJAX();
  if (!ajax) {
　　   alert ('Not compatible with XMLHttpRequest');
　　   return 0;
　  }
  if (ajax.overrideMimeType) {
    ajax.overrideMimeType('text/xml');
  }

　　ajax.onreadystatechange = onSuccess;
　　ajax.open ("GET", uri, true);
　　ajax.send ("");
}

function uploadCode(code, callback) {
    var target = document.getElementById('content_arduino');
    var spinner = new Spinner().spin(target);

    var url = "http://127.0.0.1:8080/";
    var method = "POST";

    // You REALLY want async = true.
    // Otherwise, it'll block ALL execution waiting for server response.
    var async = true;

    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function() {
        if (request.readyState != 4) { 
            return; 
        }
        
        spinner.stop();
        
        var status = parseInt(request.status); // HTTP response status, e.g., 200 for "200 OK"
        var errorInfo = null;
        switch (status) {
        case 200:
            break;
        case 0:
            errorInfo = "code 0\n\nCould not connect to server at " + url + ".  Is the local web server running?";
            break;
        case 400:
            errorInfo = "code 400\n\nBuild failed - probably due to invalid source code.  Make sure that there are no missing connections in the blocks.";
            break;
        case 500:
            errorInfo = "code 500\n\nUpload failed.  Is the Arduino connected to USB port?";
            break;
        case 501:
            errorInfo = "code 501\n\nUpload failed.  Is 'ino' installed and in your path?  This only works on Mac OS X and Linux at this time.";
            break;
        default:
            errorInfo = "code " + status + "\n\nUnknown error.";
            break;
        };
        
        callback(status, errorInfo);
    };

    request.open(method, url, async);
    request.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
    request.send(code);	     
}

function uploadClick() {
   // var code = document.getElementById('content_arduino').value;
	
	var code = Blockly.Arduino.workspaceToCode();

    alert("Ready to upload to Arduino.");
    
    uploadCode(code, function(status, errorInfo) {
        if (status == 200) {
            alert("Program uploaded ok");
        } else {
            alert("Error uploading program: " + errorInfo);
        }
    });
}

function resetClick() {
    var code = "void setup() {} void loop() {}";

    uploadCode(code, function(status, errorInfo) {
        if (status != 200) {
            alert("Error resetting program: " + errorInfo);
        }
    });
}

//Code.loadtemplate = function(mymod) {
	
	function CargarCodigo(mymod) {
	
    Code.workspace.clear();
    var myfile;
	if (mymod=="model0"){
    myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MyLoop"><block type="actuator_led"><field name="PIN">5</field><field name="STATUS">HIGH</field><next><block type="actuator_led"><field name="PIN">9</field><field name="STATUS">LOW</field><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow></value><next><block type="actuator_led"><field name="PIN">5</field><field name="STATUS">LOW</field><next><block type="actuator_led"><field name="PIN">9</field><field name="STATUS">HIGH</field><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow></value></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>';
    }
    if (mymod=="model1"){
    myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MyLoop"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">200</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">200</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="var_random"><value name="rand_min"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="rand_max"><shadow type="math_number"><field name="NUM">100</field></shadow><block type="math_number"><field name="NUM">5</field></block></value></block></value><next><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">200</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">200</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="var_random"><value name="rand_min"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="rand_max"><shadow type="math_number"><field name="NUM">100</field></shadow><block type="math_number"><field name="NUM">5</field></block></value></block></value></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>';
    }
    if (mymod=="model2"){
     myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MyLoop"><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value></block></value><value name="B"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">75</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">75</field></block></value></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><value name="B"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">75</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value></block></value><value name="B"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value><statement name="DO0"><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">75</field></block></value></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><value name="B"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value><statement name="DO0"><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">75</field></block></value></block></next></block></statement></block></next></block></next></block></next></block></statement></block></xml>';
    }
    if (mymod=="model3"){
     myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MyLoop"><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value></block></value><value name="B"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value></block></value><statement name="DO0"><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><value name="B"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><value name="B"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value></block></value><statement name="DO0"><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value></block></value><value name="B"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value><statement name="DO0"><block type="motor_stop"><field name="MOTOR_CON">MR1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value></block></next></block></next></block></next></block></statement></block></next></block></next></block></next></block></statement></block></xml>';
    }
    if(mymod=="model4"){
     myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MyLoop"><block type="controls_if"><mutation else="1"></mutation><value name="IF0"><block type="button_sensor"><field name="PIN_BUTTON">13</field><field name="LOGIC">TRUE</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value></block></statement><statement name="ELSE"><block type="motor_stop"><field name="MOTOR_CON">ML1</field></block></statement></block></statement></block></xml>';
    }
	if(mymod=="model5"){
     myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MyLoop"><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><value name="B"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.25</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value></block></value><value name="B"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.25</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><value name="B"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.25</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value></block></value><value name="B"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">1</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">70</field></block></value></block></next></block></next></block></statement></block></next></block></next></block></next></block></statement></block></xml>';
    }
	if(mymod=="model6"){
     myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MyLoop"><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><value name="B"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value></block></value><value name="B"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow></value><next><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value></block></next></block></next></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><value name="B"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow></value><next><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value></block></next></block></next></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="logic_operation"><field name="OP">AND</field><value name="A"><block type="logic_negate"><value name="BOOL"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value></block></value><value name="B"><block type="IR_status_sensor"><field name="PIN_IR">14</field></block></value></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow></value><next><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value></block></next></block></next></block></next></block></next></block></next></block></statement></block></next></block></next></block></next></block></statement></block></xml>';
    }
	if(mymod=="model7"){
     myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MySetup"><block type="Init_remotecontrolMRT"><field name="PIN">1</field><field name="CHANNEL">3</field></block></statement><statement name="MyLoop"><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x1FC3</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x1F</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x07</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x73</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x7C3</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">25</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x7F</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">25</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x70F</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">25</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x1CF</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">25</field></block></value></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x733</field></block></value><statement name="DO0"><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>';
    }
	if(mymod=="model8"){
     myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MySetup"><block type="Init_remotecontrolMRT_pindedicated"></block></statement><statement name="MyLoop"><block type="controls_if"><value name="IF0"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><statement name="DO0"><block type="actuator_led"><field name="PIN">5</field><field name="STATUS">HIGH</field><next><block type="actuator_tonedure"><field name="PIN">9</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="math_number"><field name="NUM">262</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">500</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value><next><block type="actuator_tonedure"><field name="PIN">9</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="math_number"><field name="NUM">294</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">500</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value><next><block type="actuator_tonedure"><field name="PIN">9</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="math_number"><field name="NUM">330</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">500</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value><next><block type="actuator_tonedure"><field name="PIN">9</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="math_number"><field name="NUM">349</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">500</field></block></value><next><block type="base_delays"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1</field></shadow><block type="math_number"><field name="NUM">0.5</field></block></value><next><block type="actuator_led"><field name="PIN">5</field><field name="STATUS">LOW</field></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement><next><block type="Read_remotecontrolMRT_pindedicated"><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key_pindedicated"><field name="KEY">63</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key_pindedicated"><field name="KEY">61</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">100</field></block></value></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key_pindedicated"><field name="KEY">53</field></block></value><statement name="DO0"><block type="motor_stop"><field name="MOTOR_CON">ML1</field></block></statement></block></next></block></next></block></next></block></next></block></statement></block></xml>';
    }
	if(mymod=="model9"){
     myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="38" y="113"><statement name="MyLoop"><block type="controls_if"><value name="IF0"><block type="IR_status_sensor"><field name="PIN_IR">13</field></block></value><statement name="DO0"><block type="actuator_tonedure"><field name="PIN">5</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="frequency"><field name="NOTE">C</field><field name="OCTAVE">5</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="duration"><field name="DURATION">1</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">250</field></block></value></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="button_sensor"><field name="PIN_BUTTON">15</field><field name="LOGIC">TRUE</field></block></value><statement name="DO0"><block type="actuator_tonedure"><field name="PIN">5</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="frequency"><field name="NOTE">D</field><field name="OCTAVE">5</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="duration"><field name="DURATION">1</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">250</field></block></value></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><statement name="DO0"><block type="actuator_tonedure"><field name="PIN">5</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="frequency"><field name="NOTE">E</field><field name="OCTAVE">5</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="duration"><field name="DURATION">1</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">250</field></block></value></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="button_sensor"><field name="PIN_BUTTON">14</field><field name="LOGIC">TRUE</field></block></value><statement name="DO0"><block type="actuator_tonedure"><field name="PIN">5</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="frequency"><field name="NOTE">F</field><field name="OCTAVE">5</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="duration"><field name="DURATION">1</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">250</field></block></value></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_status_sensor"><field name="PIN_IR">18</field></block></value><statement name="DO0"><block type="actuator_tonedure"><field name="PIN">5</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="frequency"><field name="NOTE">G</field><field name="OCTAVE">5</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="duration"><field name="DURATION">1</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">250</field></block></value></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="button_sensor"><field name="PIN_BUTTON">19</field><field name="LOGIC">TRUE</field></block></value><statement name="DO0"><block type="actuator_tonedure"><field name="PIN">5</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="frequency"><field name="NOTE">A</field><field name="OCTAVE">5</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="duration"><field name="DURATION">1</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">250</field></block></value></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_status_sensor"><field name="PIN_IR">20</field></block></value><statement name="DO0"><block type="actuator_tonedure"><field name="PIN">5</field><value name="NUM"><shadow type="math_number"><field name="NUM">440</field></shadow><block type="frequency"><field name="NOTE">B</field><field name="OCTAVE">5</field></block></value><value name="DUR"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="duration"><field name="DURATION">1</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">250</field></block></value></block></next></block></statement></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>';
    }
	if(mymod=="model10"){
     myfile='<xml xmlns="http://www.w3.org/1999/xhtml"><block type="arduino_setup" x="-912" y="-1087"><statement name="MySetup"><block type="Init_remotecontrolMRT"><field name="PIN">1</field><field name="CHANNEL">3</field></block></statement><statement name="MyLoop"><block type="controls_if"><mutation else="1"></mutation><value name="IF0"><block type="IR_status_sensor"><field name="PIN_IR">16</field></block></value><statement name="DO0"><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x1FC3</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x1F</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x07</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x73</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">LOW</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x7C3</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">25</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x7F</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">25</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x70F</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">25</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x1CF</field></block></value><statement name="DO0"><block type="motor_run"><field name="MOTOR_CON">ML1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">80</field></block></value><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_run"><field name="MOTOR_CON">MR1</field><field name="MOTOR_DIR">HIGH</field><value name="CONTENT"><shadow type="math_number"><field name="NUM">0</field></shadow><block type="math_number"><field name="NUM">25</field></block></value></block></next></block></next></block></statement><next><block type="controls_if"><value name="IF0"><block type="IR_Remote_Key"><field name="KEY">0x733</field></block></value><statement name="DO0"><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement><statement name="ELSE"><block type="motor_stop"><field name="MOTOR_CON">ML1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value><next><block type="motor_stop"><field name="MOTOR_CON">MR1</field><next><block type="base_delayms"><value name="DELAY_TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow><block type="math_number"><field name="NUM">2</field></block></value></block></next></block></next></block></next></block></statement></block></statement></block></xml>';
    }
    Code.loadBlocks(myfile);
    window.location.hash = '';
    modal.style.display = "none";
}


