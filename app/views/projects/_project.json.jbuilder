json.id project.id
json.slug project.slug
json.name project.name
json.description project.description
json.deadline project.deadline
json.status project.status
json.user_id project.user_id
json.user_path user_url(project.user, format: :json)
json.url project_url(project, format: :json)
json.tracks_url project_tracks_url(project, format: :json)
json.extract! project, :created_at, :updated_at
