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
  <!-- <md-dialog class="mdDialogContainer"
             :md-active.sync="showDialog"
             @md-closed="closeDialog(false)">
    <md-dialog-title class="mdDialogTitle">Detail Ticket</md-dialog-title>

    <md-dialog-content class="mdDialogContent"
                       v-if="ticket"> -->
  <div class="mdDialogContainer">
    <div class="mdDialogContent"
         v-if="ticket">
      <div class="ticketDetail">
        <md-content class="details md-scrollbar">
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
        </md-content>

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
          <md-content class="events md-scrollbar">

            <message-component :nodeInfo="nodeInfo"></message-component>
          </md-content>
        </div>
        <div class="ticketsLogs">
          <div class="title">Events</div>
          <md-content class="events">
            <logs-template :logs="logs"></logs-template>
          </md-content>
        </div>
      </div>
    </div>
  </div>
  <!-- </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>
      
    </md-dialog-actions> -->

  <!-- </md-dialog> -->
</template>

<script>
import { TICKET_PRIORITIES } from "spinal-service-ticket/dist/Constants";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { serviceTicketPersonalized } from "spinal-service-ticket";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";
import { FileExplorer } from "spinal-env-viewer-plugin-documentation/service/fileSystemExplorer.js";
import { MESSAGE_TYPES } from "spinal-models-documentation";
import { spinalIO } from "../../extensions/spinalIO";
import messageComponentVue from "spinal-env-viewer-plugin-documentation/view/notes/components/messageComponent.vue";

// import attachmentVue from "./components/attachment.vue";
import logsTemplateVue from "./components/logsTemplate.vue";
// import messageVue from "spinal-env-viewer-plugin-documentation/view/notes/components/message.vue";
import moment from "moment";

import { TICKET_EVENTS } from "../../extensions/ticketsEvents";
import EventBUS from "../../extensions/Event";

export default {
  name: "ticketDetailDialog",
  // props: ["onFinised"],
  components: {
    "logs-template": logsTemplateVue,
    "message-component": messageComponentVue,
    // "attachment-component": attachmentVue,
  },
  data() {
    return {
      showDialog: true,
      nodeInfo: undefined,
      ticket: {},
      step: {},
      logs: [],
      messages: [],
      formatStepId: "",
      note: {
        messageUser: "",
        pj: [],
      },
    };
  },

  mounted() {
    EventBUS.$on(TICKET_EVENTS.changeStep, async (data) => {
      if (data.ticket.id === this.ticket.id && data.step) {
        this.step = data.step;
        this.logs = await this.getLogs(this.ticket.id);
      }
    });
  },

  methods: {
    async opened(option) {
      this.ticket = option.selectedNode;
      this.nodeInfo = {
        selectedNode: SpinalGraphService.getRealNode(option.selectedNode.id),
      };

      await Promise.all([
        this.getStep(option.selectedNode.stepId),
        this.getLogs(option.selectedNode.id),
      ]).then((values) => {
        this.step = values[0];
        this.logs = values[1];
        // this.messages = values[2];
      });
    },

    async removed(res) {
      // if (res.closeResult) {
      // }
      // this.showDialog = false;
    },

    closed() {},

    getStep(id) {
      const info = SpinalGraphService.getInfo(id);
      if (info) return Promise.resolve(info.get());

      return SpinalGraphService.getNodeAsync(id).then((result) => {
        return result.get();
      });
    },

    getLogs(id) {
      return serviceTicketPersonalized.getLogs(id);
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
        .then(async (nextStep) => {
          this.ticket = SpinalGraphService.getInfo(ticketId).get();
          // this.step = nextStep;
          EventBUS.$emit(TICKET_EVENTS.changeStep, {
            ticket: this.ticket,
            step: nextStep,
          });
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
        .then((previousStep) => {
          this.ticket = SpinalGraphService.getInfo(ticketId).get();
          // this.step = previousStep;
          EventBUS.$emit(TICKET_EVENTS.changeStep, {
            ticket: this.ticket,
            step: previousStep,
          });
        });
    },

    getItemContext(id) {
      const realNode = SpinalGraphService.getRealNode(id);
      const contextId = realNode.contextIds._attribute_names[0];
      return SpinalGraphService.getInfo(contextId).get();
    },
  },
  watch: {
    step() {
      this.formatStepId = this.step && this.step.name ? this.step.name : "";
    },
  },
  computed: {
    // formatStepId(stepId) {
    //   return this.step && this.step.name ? this.step.name : "";
    // },
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
  height: calc(100% - 15px);
}

.mdDialogContainer .mdDialogContent {
  width: calc(100% - 48px);
  height: 100%;
  margin: auto;
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
  background: transparent !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mdDialogContainer .mdDialogContent .ticketDetail .ticketActions .actionList {
  width: 70%;
  display: flex;
  justify-content: center;
  background: transparent !important;
}

.mdDialogContainer
  .mdDialogContent
  .ticketDetail
  .ticketActions
  .actionList
  .actions {
  border: 1px solid grey;
  margin-bottom: 10px;
}

.mdDialogContainer .mdDialogContent .ticketDetail .details {
  width: 49%;
  height: 100%;
  padding-right: 10px;
  overflow: auto;
  background: transparent !important;
}

.mdDialogContainer .mdDialogContent .ticketDetail .details .detail {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .ticketDetail .details .detail .value {
  color: #448aff;
  text-transform: capitalize;
}

.mdDialogContainer .mdDialogContent .content {
  width: 100%;
  height: 60%;
  display: flex;
  justify-content: space-between;
}

.mdDialogContainer .mdDialogContent .content .ticketsNotes,
.mdDialogContainer .mdDialogContent .content .ticketsLogs {
  width: 49%;
  height: calc(100% - 5px);
  border: 1px solid grey;
}

.mdDialogContainer .mdDialogContent .content .ticketsNotes .title,
.mdDialogContainer .mdDialogContent .content .ticketsLogs .title {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid grey;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mdDialogContainer .mdDialogContent .content .ticketsNotes .events,
.mdDialogContainer .mdDialogContent .content .ticketsLogs .events {
  width: 100%;
  height: calc(100% - 60px);
  padding-bottom: 5px;
  overflow: auto;
  background: transparent !important;
}

.mdDialogContainer .mdDialogContent .content .ticketsNotes .events {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>