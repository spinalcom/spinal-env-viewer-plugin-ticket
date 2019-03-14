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
	</p>
	<textarea  class="dataElement" id="textarea_for_note" v-model="note"></textarea>		
	<md-button class="md-raised md-primary" style="display: block;" v-on:click="changeTicket">Valider</md-button>
	<md-button class="md-raised md-accent" style="display: inline-block;" v-on:click="deleteTicket">Supprimer</md-button>
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
		note: "",
		ticketName: "",
		select: ""
    };
  },
  methods: {
    opened: function() { },
    closed: function() { },
    changeTicket: function() {
		let realNode = SpinalGraphService.getRealNode(this.updateticketObj.id.get());
		if (this.newAttrNote === true) {
			realNode.info.add_attr({node: this.note});
			SpinalGraphService.modifyNode(realNode.info.id.get(), {node: this.note});
		} else
			realNode.info.note.set(this.note);

		if (this.currentSelect !== this.select) {
			console.log(this.stepNode);

			SpinalServiceTicket.moveTicket(this.updateticketObj.id.get(), this.stepNode[this.currentSelect].info.id.get(), this.stepNode[this.select].info.id.get())
		}
    },
    deleteTicket: function () {
		let node = SpinalGraphService.getRealNode(this.updateticketObj.id.get());
        node.removeFromGraph();

        let close = document.getElementsByClassName("unique-button-for-close-diag");
		close[0].click();
    }
  },
  mounted: function() {
	this.select = this.listOfSteps[0];
	this.currentSelect = this.select;
	console.log(this.listOfSteps, this.select);
	if (this.updateticketObj.note === undefined) {
		this.note = "";
		this.newAttrNote = true;
	} else
		this.note = this.updateticketObj.note.get();
	console.log(this.updateticketObj);
	this.ticketName = this.updateticketObj.name.get();
  }
};

</script>

<style scoped>
#modifyPanelTicket {
	margin-left: 10px;
}
#textarea_for_note {
	width: 350px;
	height: 60px;
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
