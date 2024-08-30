import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    prefix: String,
  }

  static targets = ["output"];

  /**
   * @param {InputEvent} event
   */
  describe(event) {
    this.outputTargets.forEach((output) => {
      output.value = this.#describe(event.target.value);
    });
  }

  #describe(input) {
    if (this.prefixValue) {
      return `${this.prefixValue}: ${input}`
    }

    return input
  }
}
