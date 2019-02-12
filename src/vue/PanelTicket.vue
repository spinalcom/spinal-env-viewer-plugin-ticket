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
   <select v-model="stepList">
    <option disabled value="">Chose Process</option>
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

  <updateticket v-if="selected==1"
                :updateticketObj="updateticketObj"
                :listOfSteps="stepsList"></updateticket>
  <md-button v-if="selected==1" class="md-raised md-accent" style="margin-left:80px; margin-top:19px" v-on:click="selected=0">Return</md-button>
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
    opened: function(option) {
      let self = this;
      this.tickets = [];
      SpinalGraphService.getChildren(SpinalGraphService.getContext("Ticket Service").info.id.get())
      .then(k => k.forEach(function(el){ self.tickets.push(el.name.get()); } ) );
    },
    closed: function() {
      console.log("closed ticketpanel");
    },
    onHideBimObject: function ( event ) {
      console.log( "hide bim obj event", event )
    },
    hasChildInContext: function (id, contextId) {
      return SpinalGraphService.hasChildInContext(id, contextId);
    },
    onNodeSelected: function(event) {
      console.log(event);
      this.activeNodesId = [ event.nodeId ];
    },
    zoomRoom: function(event) {
      console.log("event  selecte room");
      let str = event.target.parentElement.firstElementChild.innerText;

      for (var i in this.ticketNode) {
        if (this.ticketNode[i].note.get() === str) {
          //window.spinal.ForgeViewer.viewer.select(this.ticketNode[i].element.info.model_id);
          //let el = SpinalGraphService.getRealNode(this.ticketNode[i].element.info.id.get());
          console.log(this.ticketNode[i].element);
          //window.spinal.ForgeViewer.viewer.select(el.)

          console.log(this.ticketNode[i])
        }
      }
    },
    modifyTicket: function(event) {

      let nodeValue = event.target.previousSibling.previousElementSibling.innerText;

      for (var i in this.ticketNode) {
        if (this.ticketNode[i].note.get() === nodeValue) {
          this.updateticketObj = this.ticketNode[i];
          console.log("found ticket", nodeValue);
        }
      }

      this.selected = 1;
    },
    selectSteps: function(event) {
      //console.log("selected steps", event, this.selectedProcess);
      let str = event.target.innerText;
      //str = str.replace(/\s+/g, '');
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

    }
  },
  watch: {
    stepList:  function(value) {

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
        console.log(processName, value)
        if (processName.info.name.get() === value) {
          self.selectedProcess = processName;
          SpinalServiceTicket.getStepsFromProcessAsync(iterator_value)
          .then((k) => {
             let stepsName = [];
             let name;

             for (var i in k) {
                name = SpinalGraphService.getRealNode(k[i].id.get()).info.name.get();
                stepsName.push(name);
                if (name == "Declared") {
                  let realnode = SpinalGraphService.getRealNode(k[i].id.get());

                  realnode.getChildren().then((tickets) => {
                       for (var node in tickets) {

                          self.ticketNode.push(tickets[node]);
                          console.log(tickets[node]);
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
