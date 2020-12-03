<!--
Copyright 2020 SpinalCom - www.spinalcom.com

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
  <md-dialog :md-active.sync="showDialog"
             @md-closed="closeDialog(false)"
             class="mdDialog">
    <md-dialog-title class="mdDialogTitle">Create Ticket context
    </md-dialog-title>

    <md-dialog-content>
      <md-field>
        <label>Common incident name</label>
        <md-input v-model="inputValue"
                  ref="nameTextField"></md-input>
      </md-field>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>

      <md-button :disabled="inputValue.trim().length === 0"
                 class="md-primary"
                 @click="closeDialog(true)">Save</md-button>
    </md-dialog-actions>

    <!-- <form class="dialogForm"
          @submit.prevent="closeDialog(true)">
      <md-dialog-content>
        <md-field>
          <label>Context name</label>
          <md-input v-model="inputValue"overflow: hidden ;
      <md-dialog-actions>
        <md-button class="md-primary"
                   @click="closeDialog(false)">Close</md-button>

        <md-button class="md-primary"
                   type="submit"
                   :disabled="!(inputValue.trim().length > 0)">Save</md-button>
      </md-dialog-actions>
    </form> -->
  </md-dialog>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";

import SortableList from "./components/sortable-list.vue";
import EventBus from "../../extensions/Event";

export default {
  name: "createCommonIncidentDialog",
  props: ["onFinised"],
  components: {
    "sortable-list": SortableList,
  },
  data() {
    return {
      showDialog: true,
      inputValue: "",
      processId: null,
      callback: undefined,
    };
  },
  methods: {
    opened(option) {
      this.processId = option.id;
      this.callback = option.callback;
      this.autoFocusNameInput();
    },

    async removed(res) {
      const value = res.inputValue.trim();

      if (res.closeResult && value.length > 0) {
        const id = await serviceTicketPersonalized.addCommonIncident(
          this.processId,
          value
        );

        EventBus.$emit("commonIncidentCreated", id);

        // if (this.callback) {
        //   this.callback(id);
        // }
      }

      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised({
          closeResult,
          inputValue: this.inputValue,
        });
      }
    },

    autoFocusNameInput() {
      setTimeout(() => {
        this.$refs["nameTextField"].$el.focus();
      }, 200);
    },
  },
};
</script>



