<!--
Copyright 2018 SpinalCom - www.spinalcom.com
This file is part of SpinalCore.
Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.
This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.
If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
	<div style="margin-left: 10px">
	<p>Change ticket's step</p>
	<select v-bind="select">
		<option v-for="steps in listOfSteps"  >
			{{ steps }}	
		</option>
	</select>	
	<p>Change ticket's note</p>
	<input type="text" v-model="note">
	<md-button class="md-raised md-primary button-valid-modif-ticket" style="position:absolute; margin-top:40px" v-on:click="changeTicket">Change</md-button>
	</div>
</template>

<script>
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

export default {
  name: "PanelUpdateTicket",
  props: ["updateticketObj", "listOfSteps"],
  data() {
    return {
		stepsSelected: "",
		note: ""
    };
  },
  methods: {
    opened: function() {
     console.log("update open");
    },
    closed: function() {
      console.log("closed ticketpanel");
    },
    changeTicket: function() {
		let realNode = SpinalGraphService.getRealNode(this.updateticketObj.id.get());
		console.log(realNode);
		console.log("note =", this.note, " step =",this.stepsSelected);
    }
  },
  mounted: function() {
	this.select = this.listOfSteps[0];
	console.log(this.updateticketObj);
	this.note = this.updateticketObj.note.get();
  }
};

</script>

<style scoped>
#modifyPanelTicket {
	margin-left: 10px;
}
#utton-valid-modif-ticket {
	margin-top: 1px;
}
</style>
