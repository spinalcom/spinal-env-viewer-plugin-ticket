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
            <label>Name of the ticket</label>
            <md-input v-model="ticketName"></md-input>
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
  import { mapState } from 'vuex';

  export default {
    name: "AddTicket",

    data: function () {
      return {
        ticketName: ""
      }
    },

    computed: mapState( ['displayAddTicket', 'selectedNode'] ),

    methods: {
      onConfirm: function () {
        const ticketId = SpinalServiceTicket.createTicket( { name: this.ticketName } );
        SpinalServiceTicket.addTicket( ticketId, this.selectedNode.id.get() )
          .then( () => {
            this.$store.commit( 'TOGGLE_ADD_TICKET' );
          } )
          .catch( ( e ) => {
            console.error( 'loris',e )
          });
      },

      onCancel: function () {
        this.$store.commit( 'TOGGLE_ADD_TICKET' )
      }
    }
  }
</script >

<style scoped>

</style>