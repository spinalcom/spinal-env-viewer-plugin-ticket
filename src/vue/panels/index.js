import TicketManagerPanel from './ticketManager.vue';
import TicketDetailDialog from "./ticketDetailPanel.vue";
import ManageTicketPanel from "./manageTicketPanel.vue";
import Vue from "vue";

const {
  SpinalForgeExtention,
} = require("spinal-env-viewer-panel-manager-service_spinalforgeextention");


const panels = [{
    name: "ticketManagerPanel",
    vueMountComponent: Vue.extend(TicketManagerPanel),
    panel: {
      title: "Ticket Manager",
      closeBehaviour: "hide",
    },
    style: {
      height: "475px",
      left: "400px",
    },
  },
  {
    name: "ticketDetailDialog",
    vueMountComponent: Vue.extend(TicketDetailDialog),
    panel: {
      title: "Ticket Detail",
      closeBehaviour: "hide",
    },
    style: {
      minWidth: "770px",
      height: "475px",
      left: "400px",
    },
  },
  {
    name: "manageTicketPanel",
    vueMountComponent: Vue.extend(ManageTicketPanel),
    panel: {
      title: "Manage Ticket",
      closeBehaviour: "hide",
    },
    style: {
      height: "475px",
      left: "400px",
    },
  }
]

for (let index = 0; index < panels.length; index++) {
  const element = panels[index];
  const panelExtension = SpinalForgeExtention.createExtention(element);
  SpinalForgeExtention.registerExtention(element.name, panelExtension);
}