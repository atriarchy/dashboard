import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["searchable"]

  /**
   * @param {InputEvent} event
   */
  search(event) {
    const text = event.target.value
    if (text.length < 1) {
      this.#displayAll()
      return
    }

    this.searchableTargets.forEach(element => {
      if (this.#matches(element, text)) {
        element.classList.remove('hidden')
        element.hidden = false
      } else {
        element.classList.add('hidden')
        element.hidden = true
      }
    })
  }

  #matches(element, text) {
    const searchable = element.dataset.searchable

    return searchable.toLowerCase().includes(text.toLowerCase())
  }

  #displayAll() {
    this.searchableTargets.forEach(element => {
      element.classList.remove('hidden')
      element.hidden = false
    })
  }
}
