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
             @md-closed="closeDialog(false)">
    <form class="dialogForm"
          @submit.prevent="closeDialog(true)">
      <md-dialog-title>Create Process Context</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>Process name</label>
          <md-input ref="nameTextField"
                    v-model="process.name"></md-input>
        </md-field>

      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary"
                   @click="closeDialog(false)">Close</md-button>
        <md-button class="md-primary"
                   type="submit"
                   :disabled="!(process.name.trim().length > 0)">Save
        </md-button>
      </md-dialog-actions>

    </form>

  </md-dialog>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";

export default {
  name: "createProcessDialog",
  props: ["onFinised"],
  data() {
    return {
      showDialog: true,
      contextId: undefined,
      process: {
        name: "",
      },
    };
  },
  methods: {
    opened(option) {
      this.autoFocusNameInput();
      this.contextId = option.contextId;
    },

    async removed(res) {
      if (res.closeResult && res.process.name.length > 0 && this.contextId) {
        serviceTicketPersonalized.createProcess(res.process, this.contextId);
      }

      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised({ closeResult, process: this.process });
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

<style scoped>
.dialogForm {
  display: flex;
  flex-direction: column;
}
</style>