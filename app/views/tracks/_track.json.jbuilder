json.id track.id
json.name track.name
json.description track.description
json.song_type track.song_type
json.project_id track.project_id
json.project_url project_url(track.project_id, format: :json)
json.url project_track_url(track.project_id, track, format: :json)
json.collaborator_url project_track_collaborators_url(track.project_id, track.id, format: :json)
json.extract! track, :created_at, :updated_at
