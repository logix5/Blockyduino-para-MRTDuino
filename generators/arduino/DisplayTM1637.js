/***************************************************************
 *
 *  This module was created by Oscar Ferruz. oferruz@logix5.com
 *
 ****************************************************************/
goog.provide('Blockly.Blocks.DisplayTM1637');

goog.require('Blockly.Blocks');

Blockly.Arduino['DisplayTM1637_init'] = function(block) {
	
  var numberdisplay = this.getFieldValue('TM1637_NUMBER'); 	
  var pin_clk = this.getFieldValue('PIN_CLK');
  var pin_dio = this.getFieldValue('PIN_DIO');
   
  
 Blockly.Arduino.definitions_['define_TM1637_library'] = '#include <TM1637Display.h>';
 Blockly.Arduino.definitions_['define_TM1637_segment_variable'+ numberdisplay] = 'uint8_t segmentTM1637_'+numberdisplay+'[] = { 0x00, 0x00, 0x00, 0x00 };\n';
 Blockly.Arduino.definitions_['define_TM1637_' + numberdisplay] = 'TM1637Display tm1637_'+numberdisplay+'('+pin_clk+','+pin_dio+');\n';
  
  var code='';
  return code;
   
};

Blockly.Arduino['DisplayTM1637_setBrightness'] = function(block) {
 var numberdisplay = this.getFieldValue('TM1637_NUMBER'); 	
 var power = this.getFieldValue('TM1637_POWER'); 
 var britghness = Blockly.Arduino.valueToCode(this, 'Brightness', Blockly.Arduino.ORDER_ATOMIC);
 
 
  var code = 'tm1637_'+numberdisplay+'.setBrightness('+britghness+','+power+');\n';
  return code;
};


Blockly.Arduino['DisplayTM1637_clear'] = function(block) {
 var numberdisplay = this.getFieldValue('TM1637_NUMBER'); 		

  var code = 'tm1637_'+numberdisplay+'.clear();\n';
  return code;
};

Blockly.Arduino['DisplayTM1637_set_numberall'] = function(block) {
 var numberdisplay = this.getFieldValue('TM1637_NUMBER'); 	
 var value = Blockly.Arduino.valueToCode(this, 'valuenumber', Blockly.Arduino.ORDER_ATOMIC);
 var pos = Blockly.Arduino.valueToCode(this, 'Digit', Blockly.Arduino.ORDER_ATOMIC);
 var length = Blockly.Arduino.valueToCode(this, 'Length', Blockly.Arduino.ORDER_ATOMIC);
 var leading = this.getFieldValue('TM1637_LEADING');
 
  var code = 'tm1637_'+numberdisplay+'.showNumberDec('+value+','+leading+','+length+','+pos+');\n';
 
 return code;
};

Blockly.Arduino['DisplayTM1637_setsegment'] = function(block) {
 var numberdisplay = this.getFieldValue('TM1637_NUMBER'); 		
 var digit = Blockly.Arduino.valueToCode(this, 'SegmentDigit', Blockly.Arduino.ORDER_ATOMIC);
 var value = Blockly.Arduino.valueToCode(this, 'SegmentValue', Blockly.Arduino.ORDER_ATOMIC);
  
  var code = 'segmentTM1637_'+numberdisplay+'['+digit+']='+value+';\n';;
  return code;
};


Blockly.Arduino['DisplayTM1637_segments'] = function(block) {
 var numberdisplay = this.getFieldValue('TM1637_NUMBER'); 	
 var pos = Blockly.Arduino.valueToCode(this, 'Digit', Blockly.Arduino.ORDER_ATOMIC);
 var length = Blockly.Arduino.valueToCode(this, 'Length', Blockly.Arduino.ORDER_ATOMIC);

 
  var code = 'tm1637_'+numberdisplay+'.setSegments(segmentTM1637_'+numberdisplay+','+length+','+pos+');\n';
 
 return code;
};














