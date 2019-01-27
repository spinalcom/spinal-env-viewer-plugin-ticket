<!--
  - Copyright 2019 SpinalCom - www.spinalcom.com
  -
  -  This file is part of SpinalCore.
  -
  -  Please read all of the following terms and conditions
  -  of the Free Software license Agreement ("Agreement")
  -  carefully.
  -
  -  This Agreement is a legally binding contract between
  -  the Licensee (as defined below) and SpinalCom that
  -  sets forth the terms and conditions that govern your
  -  use of the Program. By installing and/or using the
  -  Program, you agree to abide by all the terms and
  -  conditions stated or referenced herein.
  -
  -  If you do not agree to abide by these terms and
  -  conditions, do not demonstrate your acceptance and do
  -  not install or use the Program.
  -  You should have received a copy of the license along
  -  with this file. If not, see
  -  <http://resources.spinalcom.com/licenses.pdf>.
  -->


<template>
    <md-dialog :md-active="displayModifyTicket">
        <md-field>
            <label>Problem</label>
            <md-input v-model="ticketName"></md-input>
        </md-field>

        <md-field>
            <label>Note</label>
            <md-input v-model="ticketNote"></md-input>
        </md-field>

        <label for="steps">Steps</label>
        <select id="steps" name="steps" v-model="selectedStep">
            <option :value="step.id" v-for="step in getStep()">
                {{step.name}}
            </option>
        </select>

        <md-dialog-actions>
            <md-button class="md-primary" v-on:click="onCancel">Close
            </md-button>
            <md-button class="md-primary" v-on:click="onConfirm">Save
            </md-button>
        </md-dialog-actions>
    </md-dialog>

</template>

<script>
  import { SpinalServiceTicket } from 'spinal-service-ticket'
  import { SpinalGraphService } from 'spinal-env-viewer-graph-service';

  import { mapState } from 'vuex';

  export default {
    name: "ModifyTicket",

    data: function () {
      return {
        selectedStep: "",
        ticketName: "",
        ticketNote: '',
        steps: [{ name: "" }]

      }
    },

    computed: mapState( ['displayModifyTicket', 'selectedNode'] ),

    methods: {
      onConfirm: function () {

        if (this.selectedStep !== this.selectedNode.stepId) {
          SpinalServiceTicket.moveTicket( this.selectedNode.id.get(),
            this.selectedNode.stepId.get(),
            this.selectedStep );
        }
        if (this.ticketName !== this.selectedNode.name) {
          SpinalGraphService
            .modifyNode(
              this.selectedNode.id.get(), {
                name: this.ticketName,
                note: this.ticketNote
              }
            )
        }
        this.$store.commit( 'TOGGLE_MODIFY_TICKET' )
      },

      onCancel: function () {
        this.$store.commit( 'TOGGLE_MODIFY_TICKET' )
      },

      getStep: function () {
        if (
          (typeof this.selectedNode !== "undefined")
          && this.selectedNode.hasOwnProperty( 'processId' )
        ) {

          const processId = this.selectedNode.processId.get();
          const stepIds = SpinalServiceTicket
            .getStepsFromProcess( processId );

          return stepIds.map( ( stepId ) => {
            const node = SpinalGraphService.getNode( stepId );
            return { id: node.id.get(), name: node.name.get() }
          } );
        }
        return [];
      }
    },
    watch: {
      'selectedNode.name': {
        handler: function ( value ) {
          console.log( 'selectedNode', this.selectedNode );

          if (typeof value !== "undefined")
            this.ticketName = value.get();
        },
        immediate: true
      },
      'selectedNode.note': {
        handler: function ( value ) {
          if (typeof value !== "undefined")
            this.ticketNote = value.get();
        },
        immediate: true
      },
      'selectedNode.stepId': {
        handler: function ( value ) {
          if (typeof value !== "undefined") {
            const node = SpinalGraphService.getNode( value.get() );
            if (node.hasOwnProperty( 'name' )) {
              this.selectedStep = node.name.get();
            }
          }
        },
        immediate: true
      }
    }
  }
</script>

<style scoped>

</style>