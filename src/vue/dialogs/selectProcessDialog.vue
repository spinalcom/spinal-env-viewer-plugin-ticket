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
  <md-dialog class="ticketMdDialogContainer"
             :md-active.sync="showDialog"
             @md-closed="closeDialog(false)">
    <md-dialog-title class="dialogTitle">Select Ticket Process</md-dialog-title>
    <md-dialog-content class="selectProcessClass">

      <!-- <div class="cont"
           v-if="loading === PAGE_STATES.success"> -->
      <!-- <md-tabs class="md-transparent"
                 md-alignment="fixed"
                 @md-changed="changeActiveTab">

          <md-tab :id="tabs.linked"
                  md-label="Linked Tickets">
            <div class="my_content">
              <tickets-vue class="tickets_class"
                           :data="tickets"
                           @reload="reloadData"></tickets-vue>
            </div>

          </md-tab> -->

      <!-- <md-tab :id="tabs.create"
                  md-label="Create new Ticket"> -->
      <div class="my_content"
           v-if="loading === PAGE_STATES.success">
        <select-process :data="data"
                        :contextId="contextId"
                        :processes="processes"
                        :processId="processId"
                        :incidents="incidents"
                        :incidentId="incidentId"
                        @selectContext="selectContext"
                        @selectProcess="selectProcess"
                        @selectIncident="selectIncident"
                        @createCommonIncident="createCommonIncident"
                        @createContext="createContext"
                        @createProcess="createProcess">
        </select-process>
      </div>

      <!-- </md-tab>

        </md-tabs> -->
      <!-- </div> -->
      <div class="cont loading"
           v-else-if="loading === PAGE_STATES.loading">
        loading...
      </div>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>

      <md-button class="md-primary"
                 :disabled="!(contextId && processId)"
                 @click="closeDialog(true)">Save</md-button>
    </md-dialog-actions>

  </md-dialog>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";
import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
// import linkerTemplateVue from "./components/linkerTemplate.vue";

import selectProcessVue from "./components/selectProcess.vue";

import EventBus from "../../extensions/Event";

import ticketsVue from "../panels/components/tickets.vue";

export default {
  name: "selectProcessDialog",
  props: ["onFinised"],
  components: {
    // "link-template": linkerTemplateVue,
    "select-process": selectProcessVue,
    // "tickets-vue": ticketsVue,
  },
  data() {
    this.PAGE_STATES = {
      success: 0,
      loading: 1,
    };
    this.tabs = {
      create: "createNewTicketTab",
      linked: "linkedTicketTab",
    };
    return {
      showDialog: true,
      contextId: undefined,
      processId: undefined,
      incidentId: undefined,
      selectedNode: undefined,
      data: [],
      processes: [],
      incidents: [],
      // tickets: [],
      selectedTab: this.tabs.linked,
      loading: this.PAGE_STATES.loading,
    };
  },
  mounted() {
    EventBus.$on("commonIncidentCreated", async (id) => {
      this.data = await this.getAllData();
      this.updateIncidents();
      this.incidentId = id;
    });

    EventBus.$on("ticketContextCreated", async (context) => {
      this.data = await this.getAllData();
      this.contextId = context;
    });

    EventBus.$on("ticketProcessCreated", async (process) => {
      this.data = await this.getAllData();
      this.updateProcesses();
      this.processId = process;
    });
  },
  methods: {
    async opened(option) {
      this.loading = this.PAGE_STATES.loading;
      this.selectedNode = option.selectedNode;
      const nodeId = option.selectedNode.getId().get();

      this.data = await this.getAllData();
      // this.tickets = await this.getNodeTickets(nodeId);

      this.loading = this.PAGE_STATES.success;
    },

    async removed(res) {
      if (res.closeResult && this.contextId && this.processId) {
        spinalPanelManagerService.openPanel("createTicketDialog", {
          contextId: this.contextId,
          processId: this.processId,
          incidentId: this.incidentId,
          selectedNode: this.selectedNode,
        });
      }

      this.showDialog = false;
    },

    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised({ closeResult, process: this.process });
      }
    },

    selectContext(id) {
      this.contextId = id;
    },

    selectProcess(id) {
      this.processId = id;
    },

    selectIncident(id) {
      this.incidentId = id;
    },

    getAllData() {
      const contexts = serviceTicketPersonalized.getContexts();
      let promises = contexts.map(async (context) => {
        const processes = await serviceTicketPersonalized.getAllProcess(
          context.id
        );
        const promises = processes.map(async (argProcess) => {
          const process = argProcess.get();
          process[
            "commonIncident"
          ] = await serviceTicketPersonalized.getCommonIncident(process.id);
          return process;
        });

        context["processes"] = await Promise.all(promises);
        return context;
      });
      return Promise.all(promises);
    },

    // getIcidents() {
    //   this.incidentId = undefined;

    //   if (this.contextId && this.processId) {
    //     let context = this.data.find((el) => el.id === this.contextId);
    //     if (context) {
    //       let process = context.processes.find((el) => el.id == this.processId);
    //       if (category) return process.commonIncident;
    //     }
    //   }
    //   return [];
    // },

    updateProcesses() {
      // this.categorySelected = undefined;
      this.processes = [];
      if (this.contextId) {
        let val = this.data.find((el) => el.id === this.contextId);
        if (val) this.processes = val.processes;
      }
    },

    updateIncidents() {
      this.incidents = [];
      if (this.contextId && this.processId) {
        let context = this.data.find((el) => el.id === this.contextId);
        if (context) {
          let process = context.processes.find((el) => el.id == this.processId);
          if (process) this.incidents = process.commonIncident;
        }
      }
    },

    createCommonIncident() {
      let params = this.processes.find((el) => el.id == this.processId);
      // params["callback"] = (id) => (this.incidentId = id);

      spinalPanelManagerService.openPanel("createCommonIncidentDialog", params);
    },

    createContext() {
      spinalPanelManagerService.openPanel("createTicketContextDialog");
    },

    createProcess() {
      const params = { contextId: this.contextId };
      spinalPanelManagerService.openPanel("createProcessDialog", params);
    },

    // getNodeTickets(nodeId) {
    //   return serviceTicketPersonalized
    //     .getTicketsFromNode(nodeId)
    //     .then((tickets) => {
    //       const promises = tickets.map(async (ticket) => {
    //         ticket["step"] = await this.getStep(ticket.stepId);
    //         return ticket;
    //       });

    //       return Promise.all(promises);
    //     });
    // },

    // getStep(id) {
    //   const info = SpinalGraphService.getInfo(id);
    //   if (info) return Promise.resolve(info.get());

    //   return SpinalGraphService.getNodeAsync(id).then((result) => {
    //     return result.get();
    //   });
    // },

    async reloadData() {
      const id = this.selectedNode.getId().get();
      this.tickets = await this.getNodeTickets(id);
    },

    changeActiveTab(tabId) {
      this.selectedTab = tabId;
    },
  },
  watch: {
    contextId() {
      this.processId = undefined;
      this.incidentId = undefined;

      this.updateProcesses();
      // this.updateProcesses();
    },
    processId() {
      this.incidentId = undefined;
      this.updateIncidents();
    },
  },
};
</script>

<style scoped>
.ticketMdDialogContainer {
  width: 900px;
  height: 500px;
}

.ticketMdDialogContainer .dialogTitle {
  text-align: center;
}

.ticketMdDialogContainer .selectProcessClass {
  padding: 0 20px 10px 20px;
}

.ticketMdDialogContainer .selectProcessClass .my_content {
  width: 100%;
  height: 100%;
}

/* .ticketMdDialogContainer .selectProcessClass .cont {
  width: 100%;
  height: 100%;
} */
</style>


<style>
/*
.ticketMdDialogContainer .md-dialog-container {
  width: 100%;
  height: 100%;
}

.ticketMdDialogContainer
  .selectProcessClass
  .md-tabs.md-transparent.md-alignment-fixed.md-theme-default {
  width: 100%;
  height: 100%;
}

.ticketMdDialogContainer
  .selectProcessClass
  .md-tabs.md-transparent.md-alignment-fixed.md-theme-default
  .md-tabs-navigation.md-elevation-0 {
  height: 50px;
}

.ticketMdDialogContainer
  .selectProcessClass
  .md-tabs.md-transparent.md-alignment-fixed.md-theme-default
  .md-content.md-tabs-content.md-theme-default {
  height: calc(100% - 50px) !important;
}

.ticketMdDialogContainer
  .selectProcessClass
  .md-tabs.md-transparent.md-alignment-fixed.md-theme-default
  .md-content.md-tabs-content.md-theme-default
  .md-tabs-container {
  height: 100%;
}

.ticketMdDialogContainer
  .selectProcessClass
  .md-tabs.md-transparent.md-alignment-fixed.md-theme-default
  .md-content.md-tabs-content.md-theme-default
  .md-tabs-container
  .md-tab {
  height: 100%;
}

.ticketMdDialogContainer
  .selectProcessClass
  .md-tabs.md-transparent.md-alignment-fixed.md-theme-default
  .md-content.md-tabs-content.md-theme-default
  .md-tabs-container
  .md-tab
  .my_content {
  max-width: 100%;
  height: 100%;
}*/
</style>