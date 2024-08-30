import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["output"];

  /**
   * @param {InputEvent} event File change event
   */
  preview(event) {
    const file = event.target.files[0];
    if (!file) {
      this.#output(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      this.#output(event);
    };
    reader.readAsDataURL(file);
  }

  /**
   * @params {FileReaderEvent | null} event
   */
  #output(event) {
    this.outputTargets.forEach((output) => {
      output.src = event?.target?.result || "";
    });
  }
}
