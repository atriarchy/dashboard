require "test_helper"

class TracksControllerTest < ActionDispatch::IntegrationTest
  setup do
    @track = tracks(:no_strings)
    @project = @track.project
  end

  test "anyone should get index" do
    login_as_any do
      get project_tracks_url(@project)

      assert_redirected_to project_url(@project)
    end
  end

  test "admin should get new" do
    login_as(users(:aca30))
    get new_project_track_url(@project)

    assert_response :success
  end

  test "artist should not get new" do
    login_as(users(:mikeshardest))
    get new_project_track_url(@project)

    assert_response :redirect
  end

  test "admin should create track" do
    login_as(users(:aca30))
    assert_difference("Track.count") do
      post project_tracks_url(@project), params: {
        track: {
          name: "my cool new track",
          slug: "cool-track",
          description: "this is a cool track",
          status: "recording",
          song_type: "original",
          explicit: false
        }
      }
    end

    assert_redirected_to project_url(@project)
  end

  test "artist should not create track" do
    login_as(users(:mikeshardest))
    assert_no_difference("Track.count") do
      post project_tracks_url(@project), params: {
        track: {
          name: "my cool new track",
          slug: "cool-track",
          description: "this is a cool track",
          status: "recording",
          song_type: "original",
          explicit: false
        }
      }
    end

    assert_response :redirect
  end


  test "anyone should show track" do
    login_as_any do
      get project_track_url(@project, @track)
      assert_response :success
    end
  end

  test "admin should get edit" do
    login_as(users(:aca30))
    get edit_project_track_url(@project, @track)
    assert_response :success
  end

  test "admin should be able to update track" do
    login_as(users(:aca30))
    patch project_track_url(@project, @track), params: {
      track: {
        name: "my cool new track",
        slug: "cool-track",
        description: "this is a cool track",
        status: "recording",
        song_type: "original",
        explicit: false
      }
    }

    assert_redirected_to project_url(@project)
  end

  test "artist should not be able to update track" do
    login_as(users(:mikeshardest))
    patch project_track_url(@project, @track), params: {
      track: {
        name: "my cool new track",
        slug: "cool-track",
        description: "this is a cool track",
        status: "recording",
        song_type: "original",
        explicit: false
      }
    }

    track = Track.find(@track.id)

    assert_redirected_to root_path
    assert_not_equal("my cool new track", track.name)
    assert_not_equal("cool-track", track.slug)
    assert_not_equal("this is a cool track", track.description)
    assert_not_equal("recording", track.status)
    assert_not_equal(:original, track.song_type)
    assert_not_equal(false, track.explicit)
  end

  test "admin should be able to destroy track" do
    login_as(users(:aca30))
    assert_difference("Track.count", -1) do
      delete project_track_url(@project, @track)
    end

    assert_redirected_to project_url(@project)
  end

  test "artist should not be able to destroy track" do
    login_as(users(:mikeshardest))
    assert_no_difference("Track.count") do
      delete project_track_url(@project, @track)
    end

    assert_redirected_to root_path
  end
end
