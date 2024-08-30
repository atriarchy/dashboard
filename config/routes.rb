Rails.application.routes.draw do
  get "auth/:provider/callback", to: "sessions#create"
  get "/login", to: "sessions#new"
  resources :users
  resource :session, except: %i[new]
  get "login", to: "sessions#new"
  resources :invites, except: %i[new show edit update]

  resources :projects do
    resources :tracks do
      resources :collaborators
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up", to: "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker", to: "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest", to: "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  root "projects#index"
end
