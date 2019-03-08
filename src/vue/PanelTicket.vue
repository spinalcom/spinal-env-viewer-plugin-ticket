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
  <md-field>
   <md-select id="selectStepDivId" v-model="thisProcess" @md-selected="selectProcess">
    <md-option v-for="ticket in tickets" :value="ticket" class="optionForSelect">
      {{ ticket }}
    </md-option>
  </md-select>
  </md-field>
    <md-icon class="ButtonShowAllTicket md-size-1x" title="show all ticket's place" v-on:click.native="zoomAllTickets">remove_red_eye</md-icon>
  </div>

  <div class="stepbox" v-for="step in stepsList">
      <md-button type="button" v-on:click="selectSteps">{{ step }} </md-button>
  </div>

  <div class="divDisplayTickets">
    <div class="divTicketsWithButton" v-for="ticket in ticketsList">
        <p class="stepbox" v-on:click="modifyTicket"> {{ ticket }} </p>
        <md-icon class="ButtonChangeTicket" v-model="stepper" v-on:click.native="modifyTicket">edit</md-icon>
        <md-icon class="ButtonChangeTicket md-size-1x" title="find room" v-on:click.native="zoomRoom">remove_red_eye</md-icon>
    </div>
  </div>

  </div>

  <md-button v-if="selected==1" class="md-raised unique-button-for-close-diag" style="margin-left:10px; margin-top:19px" v-on:click="selected=0">Retour</md-button>
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
import {
  SPINAL_TICKET_SERVICE_TARGET_RELATION_NAME
} from "spinal-service-ticket/dist/Constants";

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
      thisProcess: {},
      stepsList: [],
      stepList: '',
      ticketNode: [],
      steps: [],
      ticketsList: [],
      nodes: {},
      displayNodes: [],
      ticketToZoom: {},
      activeNodesId: [],
      selected: 0
    };
  },
  methods: {
    opened: function() {
      let self = this;
      this.viewer = window.spinal.ForgeViewer.viewer;
      this.tickets = [];
      this.arrayOfSelect = [];
      this.doc = document;
      SpinalGraphService.getChildren(SpinalGraphService.getContext("Ticket Service").info.id.get())
      .then(k => k.forEach(function(el){
        self.tickets.push(el.name.get());
        self.thisProcess = self.tickets[0];
      })

      );
      if (this.stepList !== "")
        this.selectProcess(this.thisProcess);
    },
    closed: function() {
      this.nodes = {};
      this.displayNodes = [];
      //this.stepsList = [];
      //this.ticketsList = [];
      this.ticketNode = [];
    },
    hasChildInContext: function (id, contextId) {
      return SpinalGraphService.hasChildInContext(id, contextId);
    },
    onNodeSelected: function(event) {
      this.activeNodesId = [ event.nodeId ];
    },
    zoomRoom: function(event) {

      let str = event.target.parentElement.firstElementChild.innerText;

      for (var i in this.ticketNode) {
        if (this.ticketNode[i].name.get() === str) {
          let realNode = SpinalGraphService.getRealNode(this.ticketNode[i].id.get());

          let self = this;
          realNode.find( [
            SPINAL_TICKET_SERVICE_TARGET_RELATION_NAME,
            "hasBIMObject",
            'hasReferenceObject'
          ],
          this.predicat
          )
          .then( lst => {
            self.viewer.clearSelection();
            let result = lst.map( x => x.info.dbid.get() );
            self.viewer.select( result );
          } );
        }
      }
    },
    predicat: function( node ) {
      return node.info.type.get() === "BIMObject";
    },
    modifyTicket: function(event) {

      let nodeValue = event.target.previousSibling.previousElementSibling.innerText;

      for (var i in this.ticketNode) {
        if (this.ticketNode[i].name.get() === nodeValue) {
          this.updateticketObj = this.ticketNode[i];
        }
      }

      this.selected = 1;
    },
    zoomAllTickets: function(event) {
      let self = this;
      let realNode;
      let arrToColor = [];

      for (var index in this.listOfStepsForProcess) {

          this.listOfStepsForProcess[index].getChildren().then((tickets) => {
            for (var node in tickets) {
              realNode = SpinalGraphService.getRealNode(tickets[node].info.id.get());
              // this.viewer.impl.setSelectionColor(new THREE.Color(realNode.info.color.get()))
              realNode.find( [
                SPINAL_TICKET_SERVICE_TARGET_RELATION_NAME,
                "hasBIMObject",
                'hasReferenceObject'
              ],
              this.predicat
              )
              .then( lst => {
                let result = lst.map( function(x) { self.ticketToZoom[x.info.dbid.get()] = realNode.info.color.get(); return (x.info.dbid.get()) });
                arrToColor = arrToColor.concat(result);
                //self.viewer.select( result );
                //this.setColorMaterial(result, realNode.info.color.get());
              } );
            }
        });
      }

      setTimeout(function() {
        self.setColorMaterial(arrToColor);
      }, 500);
       window.addEventListener("click", this.eventForColor, true);

    },
    eventForColor: function(event) {
      this.restoreColorMaterial(this.arrayOfSelect);
      window.removeEventListener("click", this.eventForColor, true);
      event.preventDefault();
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
                self.ticketsList.push(tickets[node].name.get());
              }
            });
          }
        }
      })
    },
    addMaterial: function(color) {
      let material = new THREE.MeshPhongMaterial({
        color: color
      });
      this.viewer.impl.createOverlayScene("temperary-colored-overlay", material, material);
      return material;
    },
    setColorMaterial: function(objectids) {
      let self = this;
      let material;

      for (var i=0; i<objectids.length; i++ ) {

        let objectId = objectids[i];
        material = self.addMaterial(self.ticketToZoom[objectId]);
        setTimeout(function() {

          self.arrayOfSelect.push(objectId);
          var it = self.viewer.model.getData().instanceTree;

          it.enumNodeFragments(objectId, function (fragId) {

          var renderProxy = self.viewer.impl.getRenderProxy(self.viewer.model, fragId);
          renderProxy.meshProxy = new THREE.Mesh(renderProxy.geometry, renderProxy.material);

          renderProxy.meshProxy.matrix.copy(renderProxy.matrixWorld);
          renderProxy.meshProxy.matrixWorldNeedsUpdate = true;
          renderProxy.meshProxy.matrixAutoUpdate = false;
          renderProxy.meshProxy.frustumCulled = false;
          self.viewer.impl.addOverlay("temperary-colored-overlay", renderProxy.meshProxy);
          self.viewer.impl.invalidate(true);

        }, 30);

        }, false);
      }
    },
    restoreColorMaterial: function(objectids) {
      let self = this;
      for (var i=0; i<objectids.length; i++ ) {
        let objectid = objectids[i];

        var it = self.viewer.model.getData().instanceTree;

        it.enumNodeFragments(objectid, function (fragId) {

        var renderProxy = self.viewer.impl.getRenderProxy(self.viewer.model, fragId);

        if(renderProxy.meshProxy){

          self.viewer.impl.clearOverlay("temperary-colored-overlay");

          delete renderProxy.meshProxy;

          self.viewer.impl.invalidate(true);

          }
        }, true);
      }
      self.arrayOfSelect = [];
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
                          self.ticketsList.push(tickets[node].info.name.get());
                        }
                  });
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
    thisProcess: {
      handler: function(value) {
    //  this.thisProcess = value;
      this.selectProcess(value);
    },
    immediate: true,
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
  height: 35px;
  margin-left: 10px;
}

.divTicketsWithButton:hover {
  background-color: #262728;
}

.ButtonChangeTicket {
  display: inline-block;
  float: right;
  margin-right: 20px;
  margin-top: 10px;
}

.ButtonShowAllTicket {
  display: inline-block;
  float: right;
  margin-right: 20px;
}

.lolkekos {
  height: 10px;
  width: 10px;
}
</style>
