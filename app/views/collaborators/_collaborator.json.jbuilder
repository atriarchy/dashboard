json.id collaborator.id
json.role collaborator.role
json.track_id collaborator.track_id
json.track_url project_track_url(collaborator.project.id, collaborator.track_id, format: :json)
json.user_id collaborator.user_id
json.user_path user_url(collaborator.user_id, format: :json)
json.url project_track_collaborator_url(collaborator.project.id, collaborator.track_id, collaborator, format: :json)
json.extract! collaborator, :created_at, :updated_at
