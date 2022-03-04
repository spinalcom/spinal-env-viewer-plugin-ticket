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
  <div class="my_content"
       v-if="!isLoading">
    <md-button class="md-fab md-mini md-primary md-fab-bottom-right"
               title="create ticket"
               @click="createTicket">
      <md-icon>add</md-icon>
    </md-button>

    <tickets-vue class="tickets_class"
                 :data="tickets"
                 @reload="reloadData"></tickets-vue>
  </div>

  <div class="loading"
       v-else>
    <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
  </div>
</template>

<script>
import { serviceTicketPersonalized } from "spinal-service-ticket";
import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

import EventBus from "../../extensions/Event";
import ticketsVue from "./components/tickets.vue";

export default {
  name: "manageTicketPanel",
  components: {
    "tickets-vue": ticketsVue,
  },
  data() {
    return {
      tickets: [],
      selectedNode: undefined,
      isLoading: false,
    };
  },
  methods: {
    async opened(option) {
      // console.log("option", option);
      this.isLoading = true;
      this.selectedNode = option.selectedNode;
      SpinalGraphService._addNode(option.selectedNode);
      const nodeId = option.selectedNode.getId().get();

      this.tickets = await this.getNodeTickets(nodeId);
      this.isLoading = false;
    },

    closed() {},

    getNodeTickets(nodeId) {
      return serviceTicketPersonalized
        .getTicketsFromNode(nodeId)
        .then((tickets) => {
          // console.log(tickets);
          const promises = tickets.map(async (ticket) => {
            ticket.step = await this.getStep(ticket);
            return ticket;
          });

          return Promise.all(promises).then((result) => {
            return result.filter((el) => el.step);
          });
        });
    },

    async getStep(ticketInfo) {
      const stepId = ticketInfo.stepId;

      const info = SpinalGraphService.getInfo(stepId);
      if (info) return info.get();

      const parents = await SpinalGraphService.getParents(ticketInfo.id, []);
      // console.log(parents);

      const found = parents.find((el) => el.id.get() === stepId);
      if (found) return found.get();

      // //  return SpinalGraphService.getNodeAsync(id).then((result) => {
      // //     return result.get();
      // //  });
    },

    async reloadData() {
      const id = this.selectedNode.getId().get();
      this.tickets = await this.getNodeTickets(id);
    },

    createTicket() {
      spinalPanelManagerService.openPanel("selectProcessDialog", {
        selectedNode: this.selectedNode,
      });
    },
  },
};
</script>

<style scoped>
.my_content {
  width: 100%;
  height: calc(100% - 15px);
}

.loading {
  width: 100%;
  height: calc(100% - 15px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>