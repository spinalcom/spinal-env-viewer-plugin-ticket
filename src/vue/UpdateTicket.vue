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
	<p class="lineDataForTicket">Titre du ticket :      {{ ticketName }}</p>
	<p class="lineDataForTicket">Changer l'état du ticket 
	<select class="dataElement" v-model="select">
		<option v-for="steps in listOfSteps">
			{{ steps }}	
		</option>
	</select>
	</p>
	<p class="lineDataForTicket">Changer la note du ticket
	<input class="dataElement" type="text" v-model="note">
	</p>
	<md-button class="md-raised md-primary button-valid-modif-ticket" style="position:absolute; margin-top:15px" v-on:click="changeTicket">Valider</md-button>
	</div>
</template>

<script>
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import { SpinalServiceTicket } from 'spinal-service-ticket';
export default {
  name: "PanelUpdateTicket",
  props: ["updateticketObj", "listOfSteps", "currentProcess", "stepNode", "stepFrom"],
  data() {
    return {
		stepsSelected: "",
		note: ""
    };
  },
  methods: {
    opened: function() {
     //console.log("update open");
    },
    closed: function() {
      //console.log("closed ticketpanel");
    },
    changeTicket: function() {
		let realNode = SpinalGraphService.getRealNode(this.updateticketObj.id.get());
		//console.log(realNode);
		//console.log("current process:", this.currentProcess, " current step=", this.stepNode);
		realNode.info.note.set(this.note);

		if (this.currentSelect !== this.select) {
			//console.log();
			//console.log(this.stepNode);
			SpinalServiceTicket.moveTicket(this.updateticketObj.id.get(), this.stepNode[this.currentSelect], this.stepNode[this.select])
		}
		//SpinalServiceTicket.getTicketsFromStepAsync(realNode.info.id.get()).then(steps => console.log("steps = ", steps))
		//console.log("note =", this.note, " step =",this.select);
    }
  },
  mounted: function() {
	this.select = this.listOfSteps[0];
	this.currentSelect = this.select;
	//console.log(this.updateticketObj);
	this.note = this.updateticketObj.note.get();
	this.ticketName = this.updateticketObj.name.get()
  }
};

</script>

<style scoped>
#modifyPanelTicket {
	margin-left: 10px;
}
#button-valid-modif-ticket {
	margin-top: 1px;
}
.dataElement {
	background: #505254;
	margin-top: 4px;
	color: white;
}
.dataElement:hover {
  background-color: #262728;
}
</style>
