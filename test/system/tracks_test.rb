require "application_system_test_case"

class TracksTest < ApplicationSystemTestCase
  setup do
    @track = tracks(:no_strings)
    @project = @track.project
  end

  NEW_BTN = 'a[aria-label="New Track"]'
  EDIT_BTN = 'a[aria-label="Edit Track"]'
  DELETE_BTN = 'button[aria-label="Delete Track"]'

  test "anyone should be able to visit the index" do
    login_as_any do
      visit project_url(@project)
      assert_selector "h1", text: @project.name
      assert_selector "span", text: @track.name
    end
  end

  test "admin should be able to create track" do
    login_as(users(:aca30))
    visit project_url(@project)
    find(NEW_BTN).click

    fill_in "Name", with: "Streamer Knows I'm Miserable Now"
    fill_in "Description", with: "Streamer Knows I'm Miserable Now, presented by the Atrioc Chatters Labor Union"
    select "Parody", from: "track_song_type"
    select "Demo", from: "track_status"

    find('button[aria-label="Save Track"]').click
    click_on("Streamer Knows I'm Miserable Now")
    find('a[aria-label="Edit Track"]').click

    assert_field "track_name", with: "Streamer Knows I'm Miserable Now"
    assert_field "track_description", with: "Streamer Knows I'm Miserable Now, presented by the Atrioc Chatters Labor Union"
    assert_field "track_song_type", with: "parody"
    assert_field "track_status", with: "demo"
  end

  test "artist should not be able to create track" do
    login_as(users(:mikeshardest))
    visit project_url(@project)
    assert_no_selector NEW_BTN

    visit new_project_track_url(@project)
    assert_current_path(root_path)
  end

  test "admin should be able to update track" do
    login_as(users(:aca30))
    visit project_track_url(@project, @track)
    find(EDIT_BTN).click

    fill_in "Name", with: "Good Day!"
    fill_in "Description", with: "Good Day!, presented by the Atrioc Chatters Labor Union"
    select "Original", from: "track_song_type"
    select "Finished", from: "track_status"

    find('button[aria-label="Save Track"]').click
    click_on("Good Day!")
    find('a[aria-label="Edit Track"]').click

    assert_field "track_name", with: "Good Day!"
    assert_field "track_description", with: "Good Day!, presented by the Atrioc Chatters Labor Union"
    assert_field "track_song_type", with: "original"
    assert_field "track_status", with: "finished"
  end

  test "artist should not be able to update track" do
    login_as(users(:mikeshardest))
    visit project_track_url(@project, @track)
    assert_no_selector EDIT_BTN

    visit edit_project_track_url(@project, @track)
    assert_current_path(root_path)
  end

  test "admin should be able to destroy track" do
    login_as(users(:aca30))
    visit project_track_url(@project, @track)
    find(DELETE_BTN).click

    accept_confirm
    visit project_url(@project)
    assert_no_text @track.name
  end

  test "artist should not be able to destroy track" do
    login_as(users(:mikeshardest))
    visit project_track_url(@project, @track)
    assert_no_selector DELETE_BTN
  end
end
