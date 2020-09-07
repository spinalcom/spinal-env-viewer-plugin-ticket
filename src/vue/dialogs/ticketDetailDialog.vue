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

      <div class="content">
        <div class="ticketsNotes">
          <div class="title">Comments</div>

          <md-content class="events md-scrollbar">

            <ul class="message_content">
              <message-component v-for="note in messages"
                                 :key="note.id"
                                 :date="note.date"
                                 :username="note.username"
                                 :message="note.message"
                                 :type="note.type"
                                 :file="note.file"></message-component>
            </ul>

          </md-content>
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
import moment from "moment";

import messageVue from "spinal-env-viewer-plugin-documentation/view/notes/components/message.vue";

import { TICKET_PRIORITIES } from "spinal-service-ticket/dist/Constants";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { serviceTicketPersonalized } from "spinal-service-ticket";
import logsTemplateVue from "./components/logsTemplate.vue";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";

export default {
  name: "ticketDetailDialog",
  props: ["onFinised"],
  components: {
    "logs-template": logsTemplateVue,
    "message-component": messageVue,
  },
  data() {
    return {
      showDialog: true,
      ticket: {},
      step: {},
      logs: [],
      messages: [],
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
  width: 100%;
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
  width: 49%;
  height: calc(40% - 10px);
}

.mdDialogContainer .mdDialogContent .ticketDetail .detail {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .ticketDetail .detail .value {
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
  overflow: auto;
}

.mdDialogContainer
  .mdDialogContent
  .content
  .ticketsNotes
  .events
  .message_content {
  width: 100%;
  height: 100%;
  padding-right: 20px;
}
</style>