# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "@hotwired--stimulus.js" # @3.2.2
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "local-time" # @3.0.2
pin "tailwindcss-animate" # @1.0.7
pin "tailwindcss/plugin", to: "tailwindcss--plugin.js" # @3.4.10
pin "@stimulus-components/character-counter", to: "@stimulus-components--character-counter.js" # @5.0.0
pin "@stimulus-components/reveal", to: "@stimulus-components--reveal.js" # @5.0.0
