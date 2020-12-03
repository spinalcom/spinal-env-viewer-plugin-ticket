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
  <div class="my_content">
    <md-button class="md-fab md-mini md-primary md-fab-bottom-right"
               title="create ticket"
               @click="createTicket">
      <md-icon>add</md-icon>
    </md-button>

    <tickets-vue class="tickets_class"
                 :data="tickets"
                 @reload="reloadData"></tickets-vue>
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
    };
  },
  methods: {
    async opened(option) {
      this.selectedNode = option.selectedNode;
      const nodeId = option.selectedNode.getId().get();

      this.tickets = await this.getNodeTickets(nodeId);
    },

    closed() {},

    getNodeTickets(nodeId) {
      return serviceTicketPersonalized
        .getTicketsFromNode(nodeId)
        .then((tickets) => {
          const promises = tickets.map(async (ticket) => {
            ticket.step = await this.getStep(ticket.stepId);
            return ticket;
          });

          return Promise.all(promises);
        });
    },

    getStep(id) {
      const info = SpinalGraphService.getInfo(id);
      if (info) return Promise.resolve(info.get());

      return SpinalGraphService.getNodeAsync(id).then((result) => {
        return result.get();
      });
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
</style>