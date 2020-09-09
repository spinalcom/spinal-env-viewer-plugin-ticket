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
    <md-dialog-title class="mdDialogTitle">Detail Ticket</md-dialog-title>

    <md-dialog-content class="mdDialogContent"
                       v-if="ticket">

      <div class="ticketDetail">
        <div class="details">
          <div class="detail">
            <div class="label">Name</div>
            <div class="value">{{ticket.name}}</div>
          </div>

          <div class="detail">
            <div class="label">Actual Step</div>
            <div class="value">{{formatStepId}}</div>
          </div>

          <div class="detail">
            <div class="label">Priority</div>
            <div class="value">{{ticket.priority | formatPriority}}</div>
          </div>

          <div class="detail"
               v-if="ticket.user">
            <div class="label">Created By</div>
            <div class="value">{{ticket.user.name}}</div>
          </div>

          <div class="detail">
            <div class="label">Date creation</div>
            <div class="value">{{ticket.creationDate | formatDate}}</div>
          </div>
        </div>

        <div class="ticketActions">
          <md-list class="actionList">
            <md-list-item class="actions"
                          @click="passToNext">
              <md-icon>skip_next</md-icon>
              <span class="md-list-item-text">Pass to next step</span>
            </md-list-item>

            <md-list-item class="actions"
                          @click="backToPrevious">
              <md-icon>skip_previous</md-icon>
              <span class="md-list-item-text">Back to previous step</span>
            </md-list-item>

          </md-list>
        </div>
      </div>

      <div class="content">
        <div class="ticketsNotes">
          <div class="title">Comments</div>
          <div class="events">
            <md-content class="message_content md-scrollbar"
                        ref="message_content">
              <ul>
                <message-component v-for="note in messages"
                                   :key="note.id"
                                   :date="note.date"
                                   :username="note.username"
                                   :message="note.message"
                                   :type="note.type"
                                   :file="note.file"></message-component>
              </ul>
            </md-content>

            <div class="message_form">

              <form @submit.prevent="addNote"
                    class="noteForm">

                <md-button class="icons md-icon-button md-raised md-primary"
                           @click="addPJ">
                  <md-icon>attach_file</md-icon>
                </md-button>

                <div class="messageForm">
                  <md-content class="pjDiv md-scrollbar"
                              v-if="note.pj.length > 0">

                    <attachment-component v-for="(file,index) in note.pj"
                                          :key="index"
                                          :file="file"
                                          @remove="removePJ">{{file.name}}
                    </attachment-component>
                  </md-content>
                  <md-field class="myField">
                    <label>Message</label>
                    <md-input v-model="note.messageUser"></md-input>
                  </md-field>
                </div>

                <div class="sendBtn">
                  <md-button type="submit"
                             class="md-dense md-raised md-primary">
                    Send
                    <md-icon>send</md-icon>
                  </md-button>
                </div>

              </form>

            </div>

          </div>
        </div>
        <div class="ticketsLogs">
          <div class="title">Events</div>
          <div class="events">
            <logs-template :logs="logs"></logs-template>
          </div>
        </div>
      </div>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>
      <!-- <md-button class="md-primary"
                 @click="closeDialog(true)">Save</md-button> -->
    </md-dialog-actions>

  </md-dialog>
</template>

<script>
import { TICKET_PRIORITIES } from "spinal-service-ticket/dist/Constants";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { serviceTicketPersonalized } from "spinal-service-ticket";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { FileExplorer } from "spinal-env-viewer-plugin-documentation/service/fileSystemExplorer.js";
import { MESSAGE_TYPES } from "spinal-models-documentation";
import { spinalIO } from "../../extensions/spinalIO";

import attachmentVue from "./components/attachment.vue";
import logsTemplateVue from "./components/logsTemplate.vue";
import messageVue from "spinal-env-viewer-plugin-documentation/view/notes/components/message.vue";
import moment from "moment";

export default {
  name: "ticketDetailDialog",
  props: ["onFinised"],
  components: {
    "logs-template": logsTemplateVue,
    "message-component": messageVue,
    "attachment-component": attachmentVue,
  },
  data() {
    return {
      showDialog: true,
      ticket: {},
      step: {},
      logs: [],
      messages: [],
      note: {
        messageUser: "",
        pj: [],
      },
    };
  },
  methods: {
    async opened(option) {
      this.ticket = option.selectedNode;
      await Promise.all([
        this.getStep(option.selectedNode.stepId),
        this.getLogs(option.selectedNode.id),
        this.getNotes(option.selectedNode.id),
      ]).then((values) => {
        this.step = values[0];
        this.logs = values[1];
        this.messages = values[2];
      });
    },

    async removed(res) {
      if (res.closeResult) {
      }

      this.showDialog = false;
    },

    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised({ closeResult, inputValue: this.inputValue });
      }
    },

    getLogs(id) {
      return serviceTicketPersonalized.getLogs(id);
    },

    getNotes(id) {
      const realNode = SpinalGraphService.getRealNode(id);
      if (typeof realNode === "undefined") return Promise.resolve([]);

      return serviceDocumentation.getNotes(realNode).then((result) => {
        return result.map((note, index) => {
          return {
            id: index,
            username: note.element.username.get(),
            message: note.element.message.get(),
            date: this.toDate(note.element.date.get()),
            type: note.element.type ? note.element.type.get() : undefined,
            file: note.element.file,
            selectedNode: note.selectedNode,
            element: note.element,
          };
        });
      });
    },

    toDate: function (date) {
      return moment(date).format("MMMM Do YYYY, h:mm:ss a");
    },

    getStep(id) {
      const info = SpinalGraphService.getInfo(id);
      if (info) return Promise.resolve(info.get());

      return SpinalGraphService.getNodeAsync(id).then((result) => {
        return result.get();
      });
    },

    _sendNote(node, message, type, path) {
      serviceDocumentation.addNote(
        node,
        {
          username: window.spinal.spinalSystem.getUser().username,
          userId: FileSystem._user_id,
        },
        message,
        type,
        path
      );
      // .then((result) => {
      //   serviceDocumentation.linkNoteToGroup(
      //     this.noteContextSelected.id,
      //     this.noteGroupSelected.id,
      //     result.getId().get()
      //   );
      // });
    },

    async addNote() {
      await this.addFilesNote();
      this.note.pj = [];

      if (this.note.messageUser.trim().length === 0) return;

      const realNode = SpinalGraphService.getRealNode(this.ticket.id);

      await this._sendNote(realNode, this.note.messageUser);

      this.messages = await this.getNotes(this.ticket.id);

      this.note.messageUser = "";
    },

    addPJ() {
      const maxSize = 25000000;
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.click();
      input.addEventListener(
        "change",
        (event) => {
          const files = event.target.files;
          let filelist = [];
          for (const file of files) {
            filelist.push(file);
          }
          filelist.push(...this.note.pj);
          const sizes = filelist.map((el) => el.size);
          const filesSize = sizes.reduce((a, b) => a + b);
          if (filesSize > maxSize) {
            alert(
              "The selected file(s) is too large. The maximum size must not exceed 25 MB"
            );
            return;
          }
          this.note.pj = filelist;
        },
        false
      );
    },

    removePJ(file) {
      this.note.pj = this.note.pj.filter((el) => el.name !== file.name);
    },

    async addFilesNote() {
      if (this.note.pj.length === 0) return;

      const realNode = SpinalGraphService.getRealNode(this.ticket.id);

      const promises = this.note.pj.map(async (file) => {
        return {
          file: file,
          directory: await this._getOrCreateFileDirectory(realNode),
        };
      });

      return Promise.all(promises).then((res) => {
        return res.map((data) => {
          const type = this._getFileType(data.file);
          let files = FileExplorer.addFileUpload(data.directory, [data.file]);
          let file = files.length > 0 ? files[0] : undefined;
          this._sendNote(realNode, data.file.name, type, file);
        });
      });
    },

    async _getOrCreateFileDirectory(node) {
      let directory = await FileExplorer.getDirectory(node);
      if (!directory) {
        directory = await FileExplorer.createDirectory(node);
      }
      return directory;
    },

    _getFileType(file) {
      const imagesExtension = [
        "JPG",
        "PNG",
        "GIF",
        "WEBP",
        "TIFF",
        "PSD",
        "RAW",
        "BMP",
        "HEIF",
        "INDD",
        "JPEG 2000",
        "SVG",
      ];
      const extension = /[^.]+$/.exec(file.name)[0];
      return imagesExtension.indexOf(extension.toUpperCase()) !== -1
        ? MESSAGE_TYPES.image
        : MESSAGE_TYPES.file;
    },

    async passToNext() {
      const user = await spinalIO.getUserConnected();

      const contextId = this.ticket.contextId
        ? this.ticket.contextId
        : this.getItemContext(this.ticket.id).id;

      const processId = this.step.processId;
      const ticketId = this.ticket.id;

      serviceTicketPersonalized
        .moveTicketToNextStep(contextId, processId, ticketId, user)
        .then(async () => {
          this.ticket = await SpinalGraphService.getInfo(ticketId).get();
          this.step = await this.getStep(this.ticket.stepId);
          this.logs = await this.getLogs(this.ticket.id);
        });
    },

    async backToPrevious() {
      const user = await spinalIO.getUserConnected();

      const contextId = this.ticket.contextId
        ? this.ticket.contextId
        : this.getItemContext(this.ticket.id).id;

      const processId = this.step.processId;
      const ticketId = this.ticket.id;

      serviceTicketPersonalized
        .moveTicketToPreviousStep(contextId, processId, ticketId, user)
        .then(async () => {
          this.ticket = await SpinalGraphService.getInfo(ticketId).get();
          this.step = await this.getStep(this.ticket.stepId);
          this.logs = await this.getLogs(this.ticket.id);
        });
    },

    getItemContext(id) {
      const realNode = SpinalGraphService.getRealNode(id);
      const contextId = realNode.contextIds._attribute_names[0];
      return SpinalGraphService.getInfo(contextId).get();
    },
  },
  watch: {
    messages() {
      const element =
        this.$refs.message_content && this.$refs.message_content.$el;
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 300);
    },
  },
  computed: {
    formatStepId(stepId) {
      return this.step && this.step.name ? this.step.name : "";
    },
  },
  filters: {
    formatDate(date) {
      return moment(parseInt(date)).format("LL");
    },

    formatPriority(priority) {
      for (const key of Object.keys(TICKET_PRIORITIES)) {
        if (TICKET_PRIORITIES[key] == priority) return key;
      }
    },
  },
};
</script>

<style scoped>
.mdDialogContainer {
  width: 60%;
  height: 700px;
}

.mdDialogContainer .mdDialogTitle {
  text-align: center;
}

.mdDialogContainer .mdDialogContent {
  width: 100%;
  height: 100%;
  padding: 0 24px 0 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mdDialogContainer .mdDialogContent .ticketDetail {
  width: 100%;
  height: calc(40% - 10px);
  display: flex;
  justify-content: space-between;
}

.mdDialogContainer .mdDialogContent .ticketDetail .ticketActions {
  width: 49%;
  height: 100%;
}

.mdDialogContainer .mdDialogContent .ticketDetail .ticketActions .actionList {
  width: 70%;
  height: 100%;
  margin: auto;
  display: flex;
  justify-content: center;
  /* align-items: center; */
}

.mdDialogContainer
  .mdDialogContent
  .ticketDetail
  .ticketActions
  .actionList
  .actions {
  border: 1px solid grey;
  /* border: 1px solid #448aff; */
  margin-bottom: 10px;
}

.mdDialogContainer .mdDialogContent .ticketDetail .details {
  width: 49%;
  height: 100%;
}

.mdDialogContainer .mdDialogContent .ticketDetail .details .detail {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .ticketDetail .details .detail .value {
  /* color: #818078; */
  color: #448aff;
  text-transform: capitalize;
}

.mdDialogContainer .mdDialogContent .content {
  width: 100%;
  height: 60%;
  display: flex;
  justify-content: space-between;
}

.mdDialogContainer .mdDialogContent .content .ticketsNotes {
  width: 49%;
  height: 100%;
  border: 1px solid grey;
}
.mdDialogContainer .mdDialogContent .content .ticketsLogs {
  width: 50%;
  height: 100%;
  border: 1px solid grey;
}

.mdDialogContainer .mdDialogContent .content .ticketsNotes .title,
.mdDialogContainer .mdDialogContent .content .ticketsLogs .title {
  width: 100%;
  height: 50px;
  padding: 5px;
  border-bottom: 1px solid grey;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .content .ticketsNotes .events,
.mdDialogContainer .mdDialogContent .content .ticketsLogs .events {
  width: 100%;
  height: calc(100% - 50px);
  /* overflow: auto; */
}

.mdDialogContainer .mdDialogContent .content .ticketsNotes .events {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.mdDialogContainer
  .mdDialogContent
  .content
  .ticketsNotes
  .events
  .message_content {
  width: 100%;
  height: 70%;
  padding-right: 20px;
  overflow: auto;
}

.mdDialogContainer
  .mdDialogContent
  .content
  .ticketsNotes
  .events
  .message_form {
  width: 100%;
  height: calc(30% - 5px);
}

.mdDialogContainer
  .mdDialogContent
  .content
  .ticketsNotes
  .events
  .message_form
  .noteForm {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  padding-bottom: 5px;
}

.mdDialogContainer
  .mdDialogContent
  .content
  .ticketsNotes
  .events
  .message_form
  .noteForm
  .messageForm
  .pjDiv {
  height: 30px;
  background: transparent;
  overflow: auto;
}

.mdDialogContainer
  .mdDialogContent
  .content
  .ticketsNotes
  .events
  .message_form
  .noteForm
  .messageForm
  .pjDiv
  p {
  margin: 0px;
}

.mdDialogContainer
  .mdDialogContent
  .content
  .ticketsNotes
  .events
  .message_form
  .noteForm
  .messageForm
  .myField {
  flex: 1 1 auto;
  margin: 0px !important;
  min-height: unset !important;
  height: calc(100% - 40px);
}
</style>