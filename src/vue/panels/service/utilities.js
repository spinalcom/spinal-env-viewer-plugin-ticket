import {
  serviceTicketPersonalized
} from "spinal-service-ticket";

class Utilities {
  constructor() {}

  getAllData() {
    let contexts = this.getContexts();
    const promises = contexts.map(async (context) => {
      const processes = await this.getProcess(context.id);
      context["processes"] = await this._formatProcesses(
        context.id,
        processes
      );
      return context;
    });

    return Promise.all(promises);

  }

  getContexts() {
    return serviceTicketPersonalized.getContexts();
  }

  getProcess(contextId) {
    return serviceTicketPersonalized.getAllProcess(contextId);
  }

  getSteps(contextId, processId) {
    return serviceTicketPersonalized.getStepsFromProcess(processId);
  }

  /////////////////////////////////////////////////////////////////////////////////////////
  //                                    Private                                          //
  /////////////////////////////////////////////////////////////////////////////////////////

  _formatProcesses(contextId, processes) {
    const promises = processes.map(async (argProcess) => {
      let process = argProcess.get();

      const steps = await this.getSteps(contextId, process.id);
      process["steps"] = await this._formatSteps(contextId, process.id,
        steps);
      return process;
    });

    return Promise.all(promises);
  }

  _formatSteps(contextId, processId, steps) {
    const promises = steps.map(async (argStep) => {
      let step = argStep.get();
      const tickets = await serviceTicketPersonalized
        .getTicketsFromStep(step.id);
      step["tickets"] = tickets.map(el => el.get());
      return step;
    });

    return Promise.all(promises);
  }
}

export const utilities = new Utilities();