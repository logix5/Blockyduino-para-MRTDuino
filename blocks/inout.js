/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Colour blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.inout');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.colour.HUE = 230;


///
Blockly.Blocks['inout_highlow'] = {
  helpUrl: 'http://arduino.cc/en/Reference/Constants',
  init: function() {
    this.setColour(10);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.INOUT_HIGH_LEVEL, "HIGH"], [Blockly.Msg.INOUT_LOW_LEVEL, "LOW"]]), 'BOOL');
    this.setOutput(true, 'Boolean');
    this.setTooltip('');
  }
}; 


Blockly.Blocks['inout_digital_read'] = {
  helpUrl: 'http://arduino.cc/en/Reference/DigitalRead',
  init: function() {
    this.setColour(10);
    this.appendDummyInput()
		  .appendField(new Blockly.FieldImage("images/Digitalsignal.png",86,43))
	      .appendField(Blockly.Msg.INOUT_DIG_READ)
	      .appendField(new Blockly.FieldDropdown(profile.default.digital_input), "PIN");
    this.setOutput(true, 'Number');
    this.setTooltip('Reads the value from a specified digital pin, either HIGH or LOW');
  }
};

Blockly.Blocks['inout_analog_read'] = {
  helpUrl: 'http://arduino.cc/en/Reference/AnalogRead',
  init: function() {
    this.setColour(10);
    this.appendDummyInput()
		.appendField(new Blockly.FieldImage("images/Analogsignal.png",68,45))
        .appendField(Blockly.Msg.INOUT_ANA_READ)
        .appendField(new Blockly.FieldDropdown(profile.default.analog), "PIN");
    this.setOutput(true, 'Number');
    this.setTooltip('Return value between 0 and 1024');
  }
};

Blockly.Blocks['inout_analog_write'] = {
  init: function() {
    this.setHelpUrl('');
    this.setColour(10);    
    this.appendDummyInput()
	    .appendField(new Blockly.FieldImage("images/Analogsignal.png",68,45))
        .appendField(Blockly.Msg.INOUT_ANA_WRITE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(profile.default.analog_write), "PIN");
    this.appendValueInput("Value")
        .setCheck("Number")
        .appendField(Blockly.Msg.INOUT_VALUE2);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['inout_buildin_led'] = {
   helpUrl: 'http://arduino.cc/en/Reference/DigitalWrite',
   init: function() {
     this.setColour(10);
     this.appendDummyInput()
	  .appendField(Blockly.Msg.INOUT_BUI_LED)
	  .appendField(new Blockly.FieldDropdown([[Blockly.Msg.INOUT_HIGH_LEVEL, "HIGH"], [Blockly.Msg.INOUT_LOW_LEVEL, "LOW"]]), "STAT");
     this.setPreviousStatement(true, null);
     this.setNextStatement(true, null);
     this.setTooltip('light or off the build-in LED');
   }
};

Blockly.Blocks['inout_digital_write'] = {
  helpUrl: 'http://arduino.cc/en/Reference/DigitalWrite',
  init: function() {
    this.setColour(10);
    this.appendDummyInput()
	.appendField(new Blockly.FieldImage("images/Digitalsignal.png",86,43))
	.appendField(Blockly.Msg.INPOUT_DIGITAL_WRITE)
        .appendField(new Blockly.FieldDropdown(profile.default.digital), "PIN")
      	.appendField(Blockly.Msg.INOUT_STAT)
      	.appendField(new Blockly.FieldDropdown([[Blockly.Msg.INOUT_HIGH_LEVEL, "HIGH"], [Blockly.Msg.INOUT_LOW_LEVEL, "LOW"]]), "STAT");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.INOUT_TOOLTIP_WRITE);
  }
};

Blockly.Blocks['advanced_pulsein'] = {
  helpUrl: 'http://arduino.cc/en/Reference/pulseIn',
  init: function() {
    this.setColour(10);
    this.appendDummyInput()
                .appendField(Blockly.Msg.PulseIn)
                .appendField(new Blockly.FieldDropdown(profile.default.digital_input), "PIN")
            	.appendField(Blockly.Msg.INOUT_STAT)
                .appendField(new Blockly.FieldDropdown([[Blockly.Msg.INOUT_HIGH_LEVEL, "HIGH"], [Blockly.Msg.INOUT_LOW_LEVEL, "LOW"]]), "STAT");
    this.setOutput(true, 'Number');
    this.setTooltip('Reads a pulse (either HIGH or LOW) on a pin. For example, if value is HIGH, pulseIn() waits for the pin to go HIGH, starts timing, then waits for the pin to go LOW and stops timing. Returns the length of the pulse in microseconds. Gives up and returns 0 if no pulse starts within a specified time out.');
  }
};

