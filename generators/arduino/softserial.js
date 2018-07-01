goog.provide('Blockly.Blocks.softserial');

goog.require('Blockly.Blocks');

Blockly.Arduino['soft_init'] = function(block) {
  var dropdown_pin1 = this.getFieldValue('PIN1');
  var dropdown_pin2 = this.getFieldValue('PIN2');
  var dropdown_pinbaudios = this.getFieldValue('PINBAUDIOS');
  
  Blockly.Arduino.definitions_['define_ss'] = '#include <SoftwareSerial.h>\nSoftwareSerial mySerial('+dropdown_pin1+','+dropdown_pin2+');\n';
  Blockly.Arduino.setups_['setup_sserial'] = 'mySerial.begin('+dropdown_pinbaudios+');\n';
  var code = '';
  return code;
};

Blockly.Arduino['soft_read'] = function(block) {
  // TODO: Assemble Python into code variable.
  var code = '(mySerial.read())';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['soft_print'] = function(block) {
  var content = Blockly.Arduino.valueToCode(this, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC) || '0';
  //content = content.replace('(','').replace(')','');
  var code = 'mySerial.println('+content+');\n';
  return code;
};

Blockly.Arduino['soft_write'] = function(block) {
  var content = Blockly.Arduino.valueToCode(this, 'CONTENT', Blockly.Arduino.ORDER_ATOMIC) || '0';
  //content = content.replace('(','').replace(')','');
  var code = 'mySerial.print('+content+');\n';
  return code;
};

Blockly.Arduino['soft_available'] = function(block) {
  // TODO: Assemble Python into code variable.
  var code = 'mySerial.available()';

  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
