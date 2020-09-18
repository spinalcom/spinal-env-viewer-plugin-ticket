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
  <md-content class="table_container">
    <md-table class="mdTable"
              v-model="searched"
              md-sort="name">

      <md-table-toolbar class="myToolbar"
                        md-elevation="0">
        <div class="md-toolbar-section-start">
          <h1 class="md-title">Tickets</h1>
        </div>

        <md-field md-clearable
                  class="md-toolbar-section-end">
          <md-input placeholder="Search by name..."
                    v-model="searchByName"
                    @input="searchOnTable" />
        </md-field>
      </md-table-toolbar>

      <md-table-empty-state md-label="No Ticket found"
                            :md-description="`No ticket found for this query.`">
      </md-table-empty-state>

      <md-table-row slot="md-table-row"
                    slot-scope="{ item }">
        <md-table-cell md-label="Name"
                       md-sort-by="name">
          {{ item.name }}

        </md-table-cell>

        <md-table-cell md-label="State"
                       class="ticketName">
          <div class="color"
               :style="{'background-color' : item.step.color}"></div>
          <div class="name">{{ item.step.name }}</div>

        </md-table-cell>

        <md-table-cell md-label="Creation Date"
                       md-sort-by="creationDate">
          {{ item.creationDate | formatCreationDate }}
        </md-table-cell>

        <md-table-cell md-label="Priority"
                       md-sort-by="priority">
          {{ item.priority | displayPriority }}</md-table-cell>

        <md-table-cell md-label="Username">
          {{item.user | userName}}
        </md-table-cell>

        <md-table-cell md-label="">
          <md-menu md-size="small"
                   class="ticket_menu">
            <md-button class="md-icon-button"
                       md-menu-trigger>
              <md-icon>more_vert</md-icon>
            </md-button>

            <md-menu-content class="ticket_menu_content">
              <md-menu-item @click="passToNextStep(item)">
                <md-icon>skip_next</md-icon>
                <span>Pass to next step</span>
              </md-menu-item>

              <md-menu-item @click="backToPreviousStep(item)">
                <md-icon>skip_previous</md-icon>
                <span>Back to previous step</span>
              </md-menu-item>

              <md-menu-item @click="sendMessage(item)">
                <md-icon>comment</md-icon>
                <span>Add comment</span>
              </md-menu-item>

              <md-menu-item @click="seeDetails(item)">
                <md-icon>assignment_late</md-icon>
                <span>See Details</span>
              </md-menu-item>

              <!-- <md-menu-item @click="seeLogs(item)">
                <md-icon>receipt_long</md-icon>
                <span>See Logs</span>
              </md-menu-item> -->

            </md-menu-content>

          </md-menu>
        </md-table-cell>

      </md-table-row>
    </md-table>
  </md-content>
</template>

<script>
import { TICKET_PRIORITIES } from "spinal-service-ticket/dist/Constants";

const {
  spinalPanelManagerService,
} = require("spinal-env-viewer-panel-manager-service");

import { spinalIO } from "../../../extensions/spinalIO";

import moment from "moment";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { serviceTicketPersonalized } from "spinal-service-ticket";

import { TICKET_EVENTS } from "../../../extensions/ticketsEvents";
import EventBUS from "../../../extensions/Event";

export default {
  name: "ticketsVue",
  props: {
    data: {},
  },
  data() {
    return {
      selected: [],
      // tickets: [],
      searched: [],
      searchByName: "",
    };
  },
  mounted() {
    EventBUS.$on(TICKET_EVENTS.created, (data) => this.$emit("reload", data));
    EventBUS.$on(TICKET_EVENTS.changeStep, (data) =>
      this.$emit("reload", data)
    );

    this.searched = this.data;
  },
  methods: {
    onSelect(items) {
      this.selected = items;
    },

    searchOnTable() {
      this.searched = this.data.filter((el) =>
        el.name.toLowerCase().includes(this.searchByName.toLowerCase())
      );

      // console.log("this.searchByName", this.searchByName);
    },

    async passToNextStep(item) {
      const user = await spinalIO.getUserConnected();

      const contextId = item.contextId
        ? item.contextId
        : this.getItemContext(item.id).id;

      const processId = item.step.processId;
      const ticketId = item.id;

      serviceTicketPersonalized
        .moveTicketToNextStep(contextId, processId, ticketId, user)
        .then((step) => {
          const info = SpinalGraphService.getInfo(ticketId).get();
          EventBUS.$emit(TICKET_EVENTS.changeStep, {
            ticket: info,
            step: step,
          });
        });
    },

    async backToPreviousStep(item) {
      const user = await spinalIO.getUserConnected();

      const contextId = item.contextId
        ? item.contextId
        : this.getItemContext(item.id).id;

      const processId = item.step.processId;
      const ticketId = item.id;
      serviceTicketPersonalized
        .moveTicketToPreviousStep(contextId, processId, ticketId, user)
        .then((step) => {
          const info = SpinalGraphService.getInfo(ticketId).get();
          EventBUS.$emit(TICKET_EVENTS.changeStep, {
            ticket: info,
            step: step,
          });
        });
    },

    sendMessage(item) {
      let obj = {
        selectedNode: SpinalGraphService.getRealNode(item.id),
      };
      spinalPanelManagerService.openPanel("panel-notes", obj);
    },

    seeDetails(item) {
      const context = SpinalGraphService.getInfo(item.contextId);
      const params = {
        selectedNode: SpinalGraphService.getInfo(item.id).get(),
        context: context ? context.get() : this.getItemContext(item.id),
      };

      spinalPanelManagerService.openPanel("ticketDetailDialog", params);
    },

    getItemContext(id) {
      const realNode = SpinalGraphService.getRealNode(id);
      const contextId = realNode.contextIds._attribute_names[0];
      return SpinalGraphService.getInfo(contextId).get();
    },

    seeLogs(item) {},
  },
  filters: {
    formatCreationDate: function (date) {
      return moment(date).fromNow();
    },

    displayPriority: function (priority) {
      for (const key in TICKET_PRIORITIES) {
        if (TICKET_PRIORITIES.hasOwnProperty(key)) {
          const value = TICKET_PRIORITIES[key];
          if (value === priority) return key;
        }
      }
    },

    userName: function (user) {
      if (user && user.name) {
        return user.name;
      }
      return "";
    },
  },
  watch: {
    data() {
      // console.log("update Data");
      if (this.data) {
        this.searched = this.data;
      }
    },
  },
};
</script>

<style scoped>
.table_container {
  width: 100%;
  height: 100%;
  /* overflow: auto; */
}

.table_container .mdTable {
  width: 100%;
  height: calc(100% - 7px);
}

.table_container .mdTable .myToolbar {
  padding: 0px !important;
}

.table_container .mdTable .ticketName .color {
  width: 5px;
  height: 50px;
  margin-right: 10px;
}

.table_container .mdTable .ticketName .name {
  display: flex;
  align-items: center;
}
</style>

<style>
.md-table-cell.ticketName .md-table-cell-container {
  display: flex;
}

.md-table-cell
  .md-table-cell-container
  .md-menu.ticket_menu
  .md-button
  .md-ripple {
  padding: 0px !important;
}

.ticket_menu_content .md-menu-content-container .md-list-item-content {
  justify-content: flex-start;
}
</style>