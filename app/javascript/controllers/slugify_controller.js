import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["output"];

  /**
   * @param {InputEvent} event
   */
  input(event) {
    this.outputTargets.forEach((output) => {
      output.value = this.#slugify(event.target.value);
    });
  }

  #slugify(input) {
    return input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");
  }
}
