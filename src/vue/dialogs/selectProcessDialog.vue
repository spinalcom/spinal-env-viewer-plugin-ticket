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
    <md-dialog-title class="dialogTitle">Select Ticket Process</md-dialog-title>
    <md-dialog-content class="content">

      <div class="section">
        <link-template :title="'Contexts'"
                       :data="data"
                       :itemSelected="contextId"
                       @select="selectContext"
                       :showBtn="false"></link-template>
      </div>

      <div class="section">
        <link-template :title="'Processes'"
                       :data="processes"
                       :itemSelected="processId"
                       @select="selectProcess"
                       :showBtn="false"></link-template>

      </div>

      <div class="section">
        <link-template :title="'Common Incident'"
                       :data="incidents"
                       :itemSelected="incidentId"
                       @select="selectIncident"
                       @create="createCommonIncident"
                       :showBtn="true"></link-template>

      </div>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>

      <md-button class="md-primary"
                 :disabled="!contextId || !processId"
                 @click="closeDialog(true)">Save</md-button>
    </md-dialog-actions>

  </md-dialog>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";
import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";
import linkerTemplateVue from "./components/linkerTemplate.vue";
import EventBus from "../../extensions/Event";

export default {
  name: "selectProcessDialog",
  props: ["onFinised"],
  components: {
    "link-template": linkerTemplateVue,
  },
  data() {
    return {
      showDialog: true,
      contextId: undefined,
      processId: undefined,
      incidentId: undefined,
      selectedNode: undefined,
      data: [],
      processes: [],
      incidents: [],
    };
  },
  mounted() {
    EventBus.$on("commonIncidentCreated", async (id) => {
      this.data = await this.getAllData();
      this.updateIncidents();
      this.incidentId = id;
    });
  },
  methods: {
    async opened(option) {
      this.selectedNode = option.selectedNode;
      this.data = await this.getAllData();
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
  },
  watch: {
    contextId() {
      this.processId = undefined;
      this.incidentId = undefined;

      this.updateProcesses();
      this.updateProcesses();
    },
    processId() {
      this.incidentId = undefined;
      this.updateIncidents();
    },
  },
};
</script>

<style scoped>
.mdDialogContainer {
  width: 100%;
  height: 600px;
}
.mdDialogContainer .dialogTitle {
  text-align: center;
}
.mdDialogContainer .content {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}
.mdDialogContainer .content .section {
  width: 33%;
  border: 1px solid grey;
  border-radius: 4% 4% 0 0;
  padding: 15px;
}
/* .mdIcon {
  display: flex;
  align-items: center;
} */
</style>