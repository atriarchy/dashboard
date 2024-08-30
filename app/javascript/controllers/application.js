import { Application } from "@hotwired/stimulus";

const application = Application.start();

// Configure Stimulus development experience
application.debug = window.location.protocol === "http:";
window.Stimulus = application;

export { application };
