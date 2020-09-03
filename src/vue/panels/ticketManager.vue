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
  <md-content class="ticket_container">
    <div class="breadcrumb"
         v-if="contextSelected">
      <!-- <div class="breadcrumbItem"
           v-for="(breadcrumb,index) in breadcrumbs"
           :key="breadcrumb.id"
           @click="selectBreadcrumb(index,breadcrumb)">
        {{breadcrumb.name}}
      </div> -->

      <md-button @click="goBack">
        <md-icon>arrow_back</md-icon>
        Back
      </md-button>

    </div>

    <div class="data-content">
      <list-item v-if="pageDisplayed === PAGES.contexts"
                 :data="data"
                 @select="selectContext"></list-item>

      <list-item v-else-if="pageDisplayed === PAGES.processes"
                 :data="processes"
                 @select="selectProcess"></list-item>

      <list-item v-else-if="pageDisplayed === PAGES.steps"
                 :data="steps"
                 @select="selectStep">

        <md-list-item @click="selectAllTickets">
          <div class="stepsColor"></div>
          <span class="md-list-item-text">All</span>
          <md-icon>keyboard_arrow_right</md-icon>
        </md-list-item>

      </list-item>

      <tickets-vue v-else-if="pageDisplayed === PAGES.tickets"
                   :data="tickets"
                   @reload="reloadData"></tickets-vue>

    </div>
  </md-content>
</template>

<script>
import { utilities } from "./service/utilities";
import ListItem from "./components/listItem.vue";
// import processesVue from "./components/processes.vue";
// import stepsVue from "./components/steps.vue";
import ticketsVue from "./components/tickets.vue";

export default {
  name: "ticketManagerPanel",
  components: {
    "list-item": ListItem,
    // "contexts-vue": contextsVue,
    // "processes-vue": processesVue,
    // "steps-vue": stepsVue,
    "tickets-vue": ticketsVue,
  },
  data() {
    this.PAGES = {
      contexts: 0,
      processes: 1,
      steps: 2,
      tickets: 3,
    };
    return {
      data: [],
      pageDisplayed: this.PAGES.contexts,
      contextSelected: undefined,
      processSelected: undefined,
      stepSelected: undefined,
      // breadcrumbs: [],
      /////////////////////////////////
      //            Listes           //
      /////////////////////////////////
      processes: [],
      steps: [],
      tickets: [],
    };
  },
  async mounted() {
    await this.updateData();
  },
  methods: {
    async opened(params) {
      await this.updateData();
      this.getContextId(params);
      this.getProcessId(params);
      this.getStepId(params);
    },

    //////////////////////////////////////////
    //              SELECT                  //
    //////////////////////////////////////////
    selectContext(contextId) {
      this.contextSelected = contextId;
      this.pageDisplayed = this.PAGES.processes;
    },

    selectProcess(processId) {
      this.processSelected = processId;
      this.pageDisplayed = this.PAGES.steps;
    },

    selectStep(stepId) {
      this.stepSelected = stepId;
      this.pageDisplayed = this.PAGES.tickets;
    },

    selectAllTickets() {
      this.pageDisplayed = this.PAGES.tickets;
      this.formatAllTickets();
    },

    formatAllTickets() {
      const res = [];

      for (const step of this.steps) {
        res.push(...this._formatTickets(step));
      }

      this.tickets = res;
    },
    //////////////////////////////////////////
    //              UPDATE                  //
    //////////////////////////////////////////

    async updateData() {
      this.data = await utilities.getAllData();
    },

    updateProcesses() {
      const find = this.data.find((el) => el.id === this.contextSelected);
      if (find) {
        // this.breadcrumbs.push(find);
        this.processes = find.processes;
      }
    },

    updateSteps() {
      const find = this.processes.find((el) => el.id === this.processSelected);
      if (find) {
        // this.breadcrumbs.push(find);
        this.steps = find.steps;
      }
    },

    updateTickets() {
      if (this.stepSelected) {
        const find = this.steps.find((el) => el.id === this.stepSelected);
        if (find) {
          // this.breadcrumbs.push(find);
          this.tickets = this._formatTickets(find);
        }
      } else {
        this.formatAllTickets();
      }
    },

    //////////////////////////////////////////
    //              RESET                   //
    //////////////////////////////////////////

    resetProcesses() {
      this.contextSelected = undefined;
      this.processes = [];
    },

    resetSteps() {
      this.processSelected = undefined;
      this.steps = [];
    },
    resetTickets() {
      this.tickets = [];
      this.stepSelected = undefined;
    },

    goBack() {
      switch (this.pageDisplayed) {
        case this.PAGES.processes:
          this.pageDisplayed = this.PAGES.contexts;
          this.resetProcesses();
          break;

        case this.PAGES.steps:
          this.pageDisplayed = this.PAGES.processes;
          this.resetSteps();
          break;

        case this.PAGES.tickets:
          this.pageDisplayed = this.PAGES.steps;
          this.resetTickets();
          break;

        default:
          break;
      }
    },

    /////////////////////////////////////////
    _formatTickets(step) {
      return step.tickets.map((el) => {
        el["step"] = step;
        el["contextId"] = this.contextSelected;
        return el;
      });
    },

    async reloadData() {
      await this.updateData();
    },

    getContextId(params) {
      this.selectContext(params.context.id);
    },
    getProcessId(params) {
      let nodeId;

      if (params.context.id !== params.selectedNode.id) {
        nodeId =
          typeof params.selectedNode.processId === undefined
            ? params.selectedNode.id
            : params.selectedNode.processId;
      }

      this.selectProcess(nodeId);
    },
    getStepId(params) {
      if (typeof params.selectedNode.processId !== "undefined")
        this.selectStep(params.selectedNode.id);
    },
  },
  watch: {
    contextSelected() {
      if (this.contextSelected) this.updateProcesses();
    },
    processSelected() {
      if (this.processSelected) this.updateSteps();
    },
    stepSelected() {
      if (this.stepSelected) this.updateTickets();
    },
    data() {
      this.updateProcesses();
      this.updateSteps();
      this.updateTickets();
    },
  },
};
</script>

<style scoped>
.ticket_container {
  width: 100%;
  height: calc(100% - 15px);
}

.ticket_container .breadcrumb {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
}

.ticket_container .data-content {
  width: 100%;
  height: calc(100% - 50px);
}

.stepsColor {
  width: 5px;
  height: 50px;
  margin-right: 10px;
  background-color: white;
}
</style>