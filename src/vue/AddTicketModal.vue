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
    <md-dialog :md-active="displayAddTicket">

        <md-field>
            <md-select name="Process" v-model="selectedProcess">
                <md-option :key="index"
                           :value="process.id.get()"
                           v-for="(process, index) in getProcess()">
                    {{process.name.get()}}
                </md-option>
            </md-select>
        </md-field>

        <spinal-list :items="getCategories()"
                     @item-selected="selectedCategory = $event"/>



        <md-field>
            <label>note</label>
            <md-input aria-placeholder="note..." v-model="note"/>
        </md-field>

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
  import { SpinalGraphService } from 'spinal-env-viewer-graph-service'
  import { mapState } from 'vuex';
  import {
    SpinalList,
    SpinalListItem
  } from "spinal-env-viewer-vue-components-lib";

  export default {
    name: "AddTicket",
    components: { SpinalList, SpinalListItem },
    data: function () {
      return {
        ticketName: "",
        selectedCategory: { value: '' },
        categories: [],
        selectedProcess: '',
        note: ''
      }
    },

    computed: mapState( ['displayAddTicket', 'selectedNode', 'processes', 'categoryByProcess'] ),

    methods: {
      getProcess: function () {
        if (typeof this.processes !== "undefined") {
          const processes = [];
          for (let i = 0; i < this.processes.length; i++) {
            processes.push( SpinalGraphService.getNode( this.processes[i] ) );
          }
          return processes;
        }
        return [];
      },
      getCategories: function () {
        if (typeof this.categoryByProcess !== "undefined"
          && this.selectedProcess.length !== 0
          && this.categoryByProcess.has( this.selectedProcess )
        ) {
          return this.categoryByProcess.get( this.selectedProcess );
        }
        return [];
      },
      onConfirm: function () {
        const ticket = {
          name: this.selectedCategory.value.value,
          note: this.note,
          categories: this.selectedCategory
        };

        const ticketId = SpinalServiceTicket.createTicket( ticket );

        SpinalServiceTicket.addLocationToTicket( ticketId,
          this.selectedNode.id.get() );
        SpinalServiceTicket.addTicketToProcess( ticketId,
          this.selectedProcess )
          .then( () => {
            this.$store.commit( 'TOGGLE_ADD_TICKET' );
          } )
          .catch( ( e ) => {
            console.error( e )
          } );
      },

      onCancel: function () {
        this.$store.commit( 'TOGGLE_ADD_TICKET' )
      }
    },
    watch: {
      'selectedCategory': {
        handler: function ( value ) {
          console.log( value )
        },
        immediate: true
      }
    }
  }
</script>

<style scoped>

</style>