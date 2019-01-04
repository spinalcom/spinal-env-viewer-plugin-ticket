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
    <md-dialog-prompt
            :md-active.sync="displayAddTypology"
            @md-cancel="onCancel"
            @md-confirm="onConfirm"
            md-cancel-text="cancel"
            md-confirm-text="validate"
            md-input-maxlength="30"
            md-input-placeholder="Sentence..."
            md-title="What's the default sentence"
            v-model="typologyName"
    />

</template>

<script>
  import { SpinalServiceTicket } from 'spinal-service-ticket'
  import { mapState } from 'vuex';

  export default {
    name: "AddTypologyModal",

    data: function () {
      return {
        typologyName: ""
      }
    },

    computed: mapState( ['displayAddTypology'] ),

    methods: {
      onConfirm: function () {
        SpinalServiceTicket.createProcess( this.typologyName )
          .then( () => {
            this.$store.commit( 'toggleAddTypology' );
          } )
          .catch( ( e ) => {
            console.error( e )
          } );
      },

      onCancel: function () {
        this.$store.commit( 'toggleAddTypology' )
      }

    }
  }
</script>

<style scoped>

</style>