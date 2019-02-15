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
  <div>

  <div v-if="selected==0">

  <div id="selectStepDiv">
   <select id="selectStepDivId" v-model="stepList">
    <option disabled value="">Choose Process</option>
    <option v-for="ticket in tickets">
      {{ ticket }}
    </option>
  </select>
  </div>

  <div class="stepbox" v-for="step in stepsList">
      <md-button type="button" v-on:click="selectSteps">{{ step }} </md-button>
  </div>

  <div class="divDisplayTickets">
    <div class="divTicketsWithButton" v-for="ticket in ticketsList">
        <p class="stepbox" v-on:click="modifyTicket"> {{ ticket }} </p>
        <button class="ButtonChangeTicket" v-model="stepper" v-on:click="modifyTicket">Modify</button>
          <md-icon class="ButtonChangeTicket md-size-1x" title="find room" v-on:click.native="zoomRoom">zoom_in</md-icon>
    </div>
  </div>

  </div>

  <md-button v-if="selected==1" class="md-raised" style="margin-left:10px; margin-top:19px" v-on:click="selected=0">Retour</md-button>
  <updateticket v-if="selected==1"
                :updateticketObj="updateticketObj"
                :listOfSteps="stepsList"
                :currentProcess="selectedProcess"
                :stepNode="listOfStepsForProcess"
                :stepFrom="steps"></updateticket>
</div>
</template>

<script>
import { SpinalServiceTicket } from 'spinal-service-ticket';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import updateticket from './UpdateTicket.vue';

export default {
  name: "PanelTicket",
  components: {
      updateticket
  },
  data() {
    return {
      stepper: 1,
      selectedProcess: "",
      updateticketObj: {},
      tickets: [],
      stepsList: [],
      stepList: '',
      ticketNode: [],
      steps: [],
      ticketsList: [],
      nodes: {},
      displayNodes: [],
      activeNodesId: [],
      selected: 0
    };
  },
  methods: {
    opened: function() {
      let self = this;
      this.tickets = [];
      SpinalGraphService.getChildren(SpinalGraphService.getContext("Ticket Service").info.id.get())
      .then(k => k.forEach(function(el){ self.tickets.push(el.name.get()); console.log("lol")} ) );
      if (this.stepList !== "")
        this.selectProcess(this.thisProcess);
    },
    closed: function() {
    this.nodes = {};
    this.displayNodes = [];
    this.stepsList = [];
    this.ticketsList = [];
    this.ticketNode = [];
    },
    hasChildInContext: function (id, contextId) {
      return SpinalGraphService.hasChildInContext(id, contextId);
    },
    onNodeSelected: function(event) {
      this.activeNodesId = [ event.nodeId ];
    },
    zoomRoom: function(event) {
      //console.log("event  selecte room");
      let str = event.target.parentElement.firstElementChild.innerText;

      for (var i in this.ticketNode) {
        if (this.ticketNode[i].note.get() === str) {
          //window.spinal.ForgeViewer.viewer.select(this.ticketNode[i].element.info.model_id);
          //let el = SpinalGraphService.getRealNode(this.ticketNode[i].element.info.id.get());
          //console.log(this.ticketNode[i].element);
          //window.spinal.ForgeViewer.viewer.select(el.)

          //console.log(this.ticketNode[i])
        }
      }
    },
    modifyTicket: function(event) {

      let nodeValue = event.target.previousSibling.previousElementSibling.innerText;

      for (var i in this.ticketNode) {
        if (this.ticketNode[i].note.get() === nodeValue) {
          this.updateticketObj = this.ticketNode[i];
        }
      }

      this.selected = 1;
    },
    selectSteps: function(event) {
      let str = event.target.innerText;
      this.ticketNode = [];
      this.ticketsList = [];
      let self = this;
      SpinalGraphService.getChildren(this.selectedProcess.info.id.get()).then((childrens) => {
        for ( var i in childrens ) {
          if ( childrens[i].name.get().toUpperCase() === str.toUpperCase() ) {
            SpinalGraphService.getChildren(childrens[i].id.get()).then((tickets) => {
              for ( var node in tickets ) {
                self.ticketNode.push(tickets[node]);
                self.ticketsList.push(tickets[node].note.get());
              }
            });
          }
        }
      })

    },
    selectProcess: function(value) {
      let processName;
      let iterator_value;

      let self = this;

      this.stepsList = [];
      this.ticketsList = [];
      this.ticketNode = [];

      SpinalServiceTicket.getAllProcessAsync().then((process) => {

      let ite = 0;
      let iterator1 = process.values();

      while ( ite < process.size ) {
        iterator_value = iterator1.next().value;
        processName = SpinalGraphService.getRealNode(iterator_value);
        if (processName.info.name.get() === value) {
          self.selectedProcess = processName;
          SpinalServiceTicket.getStepsFromProcessAsync(iterator_value)
          .then((k) => {
             let stepsName = [];
             let name;
             let stepNode;
             this.listOfStepsForProcess = {};

             for (var i in k) {
                stepNode = SpinalGraphService.getRealNode(k[i].id.get());
                name = stepNode.info.name.get();
                stepsName.push(name);
                this.listOfStepsForProcess[name] = stepNode;

                if (name == "Déclarer") {
                  let realnode = SpinalGraphService.getRealNode(k[i].id.get());

                  realnode.getChildren().then((tickets) => {
                       for (var node in tickets) {
                          self.ticketNode.push(tickets[node].info);
                          self.ticketsList.push(tickets[node].info.note.get());
                        }
                  });

                   // SpinalServiceTicket.getTicketsFromStepAsync(k[i].id.get()).then((tickets) => {

                   //    for (var node in tickets) {
                   //       self.ticketNode.push(tickets[node]);
                   //       console.log(tickets[node]);
                   //       self.ticketsList.push(tickets[node].note.get());
                   //     }
                   // })

                }
             }
             self.stepsList = stepsName;
          })
          break;
        }
        ite++;
      }
      });
    }
  },
  watch: {
    stepList:  function(value) {
      this.thisProcess = value;
      this.selectProcess(value);
    },
    selected: function() {
      if (this.selected == 0)
        this.selectProcess(this.thisProcess);
    }
  },
  mounted: function() {
    this.nodes = SpinalGraphService.getNodesInfo();
    this.displayNodes.push(SpinalGraphService.getContext("Ticket Service").info.id.get());
    //let self = this;
    //SpinalGraphService.getChildren(parent.info.id.get()).then(k => k.forEach(function(el){ self.displayNodes.push(el.id.get()); } ) )
  }
};

</script>

<style>

.graph-viewer-ticket * {
    margin: 0;
    box-sizing: border-box;
}

.stepbox {
  display: inline-block;
}

#selectStepDiv {
  display: block;
  margin-left: 10px;
  margin-top: 10px;
}

.divDisplayTickets {
  display: block;
}

.divTicketsWithButton {
  /*display: inline-block;*/
  margin-left: 10px;
}

.divTicketsWithButton:hover {
  background-color: #262728;
}

.ButtonChangeTicket {
  display: inline-block;
  float: right;
  margin-right: 20px;
  margin-top: 15px;
}


</style>
