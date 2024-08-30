json.id invite.id
json.expires_at invite.expires_at
json.user_id invite.user_id
json.user_url user_url(invite.user_id, format: :json)
json.extract! invite, :created_at, :updated_at
