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
  <md-content class="table_container md-srollbar">
    <md-table v-model="searched"
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

              <md-menu-item @click="sendMessage(item)">
                <md-icon>comment</md-icon>
                <span>Send Message</span>
              </md-menu-item>
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
import moment from "moment";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { serviceTicketPersonalized } from "spinal-service-ticket";

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
    this.searched = this.data;
    console.log("this.searched", this.searched);
  },
  methods: {
    onSelect(items) {
      this.selected = items;
    },
    searchOnTable() {
      console.log("this.searchByName", this.searchByName);
    },

    passToNextStep(item) {
      const contextId = item.contextId;
      const processId = item.step.processId;
      const ticketId = item.id;

      serviceTicketPersonalized
        .moveTicketToNextStep(contextId, processId, ticketId)
        .then(() => {
          this.$emit("reload");
        });
    },

    sendMessage(item) {
      let obj = {
        selectedNode: SpinalGraphService.getRealNode(item.id),
      };
      spinalPanelManagerService.openPanel("panel-notes", obj);
    },
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
      console.log("update Data");
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
  overflow: auto;
}

.table_container .myToolbar {
  padding: 0px !important;
}

.table_container .ticketName .color {
  width: 5px;
  height: 50px;
  margin-right: 10px;
}

.table_container .ticketName .name {
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