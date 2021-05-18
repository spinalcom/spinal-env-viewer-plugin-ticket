import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";

import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

import {
  SERVICE_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_TYPE,
  SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
  SPINAL_TICKET_SERVICE_STEP_TYPE
} from "spinal-service-ticket/dist/Constants";

import {
  spinalIO
} from "../extensions/spinalIO";

import {
  SpinalGraphService
} from "spinal-env-viewer-graph-service";

import {
  serviceTicketPersonalized
} from "spinal-service-ticket";

import EventBUS from '../extensions/Event'
import {
  TICKET_EVENTS
} from '../extensions/ticketsEvents'

export class PassToNextStepButton extends SpinalContextApp {
  constructor() {
    super("Pass to next step", "Pass the ticket to next step", {
      icon: "skip_next",
      icon_type: "in",
      backgroundColor: "#356BAB",
      fontColor: "#ffffff",
    });
  }

  isShown(option) {
    const contextType = option.context.type.get();
    const nodeType = option.selectedNode.type.get();

    if (
      contextType === SERVICE_TYPE &&
      nodeType === SPINAL_TICKET_SERVICE_TICKET_TYPE
    )
      return Promise.resolve(true);
    return Promise.resolve(-1);
  }

  async action(option) {
    const user = await spinalIO.getUserConnected();

    const contextId = option.context.id.get();
    const ticketId = option.selectedNode.id.get();
    const processId = await getProcessId(ticketId);

    // console.log(contextId, ticketId, processId)

    if (contextId && ticketId && processId) {
      spinalPanelManagerService.openPanel("confirmationDialog", {
        message: "do you want to pass this ticket to the next step ?",
        callback: () => {
          serviceTicketPersonalized.moveTicketToNextStep(
            contextId,
            processId,
            ticketId,
            user
          ).then((step) => {
            const info = SpinalGraphService.getInfo(ticketId).get();
            EventBUS.$emit(TICKET_EVENTS.changeStep, {
              ticket: info,
              step: step
            });
          });
        },
      });
    }
  }
}

const getProcessId = async (ticketId) => {
  const parents = await SpinalGraphService.getParents(ticketId, [
    SPINAL_TICKET_SERVICE_TICKET_RELATION_NAME,
  ]);

  const found = parents.find(
    (el) => el.type.get() === SPINAL_TICKET_SERVICE_STEP_TYPE
  );

  if (found) return found.processId.get();
};