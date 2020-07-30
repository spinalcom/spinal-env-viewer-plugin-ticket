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
  <md-dialog class="mdDialogContainer"
             :md-active.sync="showDialog"
             @md-closed="closeDialog(false)">
    <md-dialog-title>Create Ticket context</md-dialog-title>
    <form class="dialogForm"
          @submit.prevent="closeDialog(true)">
      <md-dialog-content>
        <md-field>
          <label>Ticket name</label>
          <md-input v-model="ticket.name"
                    ref="nameTextField"></md-input>
        </md-field>

        <md-field>
          <label>Message</label>
          <md-textarea v-model="ticket.note"></md-textarea>
        </md-field>

        <md-field>
          <label>Urls</label>
          <md-textarea v-model="ticket.urls"></md-textarea>
          <span class="md-helper-text">Put one URL per line</span>
        </md-field>

        <!-- <md-field>
          <label>Pictures</label>
          <md-file v-model="ticket.images"
                   multiple />
        </md-field> -->

        <div class="addPJ">
          <input type="file"
                 @change="addAttachments"
                 ref="attachments"
                 multiple
                 name="addPJ"
                 placeholder="Add Attachment">
        </div>

      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary"
                   @click="closeDialog(false)">Close</md-button>
        <md-button class="md-primary"
                   type="submit"
                   :disabled="!(ticket.name.trim().length > 0)">Save</md-button>
      </md-dialog-actions>
    </form>
  </md-dialog>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";

export default {
  name: "createTicketDialog",
  props: ["onFinised"],
  data() {
    return {
      showDialog: true,
      contextId: undefined,
      processId: undefined,
      nodeId: undefined,
      ticket: {
        name: "",
        note: "",
        objet: null,
        images: [],
        urls: "",
      },
    };
  },
  methods: {
    opened(option) {
      this.autoFocusNameInput();
      this.contextId = option.contextId;
      this.processId = option.processId;
      this.nodeId = option.selectedNode.getId().get();
      this.ticket.objet = new Ptr(option.selectedNode);
    },

    async removed(res) {
      if (res.closeResult) {
        this.ticket.urls = this.ticket.urls.split("\n");
        this.ticket.images = new Ptr(this.ticket.images);

        serviceTicketPersonalized.addTicket(
          this.ticket,
          this.processId,
          this.contextId,
          this.nodeId
        );
      }

      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised({ closeResult, inputValue: this.inputValue });
      }
    },
    autoFocusNameInput() {
      setTimeout(() => {
        this.$refs["nameTextField"].$el.focus();
      }, 200);
    },

    addAttachments(event) {
      const files = event.target.files;
      this.ticket.images = files;
    },
  },
};
</script>

<style scoped>
.mdDialogContainer {
  width: 50%;
}

.dialogForm {
  display: flex;
  flex-direction: column;
}
</style>