import TicketManagerPanel from './ticketManager.vue';
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
}]

for (let index = 0; index < panels.length; index++) {
  const element = panels[index];
  const panelExtension = SpinalForgeExtention.createExtention(element);
  SpinalForgeExtention.registerExtention(element.name, panelExtension);
}