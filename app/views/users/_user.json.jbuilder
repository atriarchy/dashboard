json.extract! user, :id, :name, :role, :discord_id, :created_at, :updated_at
json.url user_url(user, format: :json)
