import vue from "vue";

import CreateTicketContextDialog from "./createContextDialog.vue";
import CreateProcessDialog from "./createProcessDialog.vue";
import CreateStepDialog from "./createStepDialog.vue";
import CreateTicketDialog from "./createTicket.vue";
import SelectProcessDialog from "./selectProcessDialog.vue";
import CreateCommonIncidentDialog from "./createCommonIncidentDialog.vue";
// import TicketDetailDialog from "./ticketDetailDialog.vue";
import ConfirmDialog from './confirmDialog.vue';

const {
  SpinalMountExtention
} = require("spinal-env-viewer-panel-manager-service");

const dialogs = [{
    name: "createTicketContextDialog",
    vueMountComponent: vue.extend(CreateTicketContextDialog),
    parentContainer: document.body
  }, {
    name: "createProcessDialog",
    vueMountComponent: vue.extend(CreateProcessDialog),
    parentContainer: document.body
  }, {
    name: "createStepDialog",
    vueMountComponent: vue.extend(CreateStepDialog),
    parentContainer: document.body
  }, {
    name: "createTicketDialog",
    vueMountComponent: vue.extend(CreateTicketDialog),
    parentContainer: document.body
  },
  {
    name: "selectProcessDialog",
    vueMountComponent: vue.extend(SelectProcessDialog),
    parentContainer: document.body
  }, {
    name: "createCommonIncidentDialog",
    vueMountComponent: vue.extend(CreateCommonIncidentDialog),
    parentContainer: document.body
  },
  // {
  //   name: "ticketDetailDialog",
  //   vueMountComponent: vue.extend(TicketDetailDialog),
  //   parentContainer: document.body
  // }, 
  {
    name: "confirmationDialog",
    vueMountComponent: vue.extend(ConfirmDialog),
    parentContainer: document.body
  }
];


for (let index = 0; index < dialogs.length; index++) {
  SpinalMountExtention.mount(dialogs[index]);
}