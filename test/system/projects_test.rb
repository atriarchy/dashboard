require "application_system_test_case"

class ProjectsTest < ApplicationSystemTestCase
  setup do
    @project = projects(:dwta)
    @user = @project.user
  end

  NEW_BTN = 'a[aria-label="New Project"]'
  EDIT_BTN = 'a[aria-label="Edit Project"]'
  DELETE_BTN = 'button[aria-label="Delete Project"]'

  test "anyone should be able to vist the index" do
    login_as_any do
      visit projects_url
      assert_selector "h1", text: "Projects"
      assert_selector "span", text: @project.name
    end
  end

  test "admin should be able to create project" do
    login_as(users(:aca30))
    visit projects_url
    find(NEW_BTN).click

    fill_in "Name", with: "Atrionix"
    fill_in "Description", with: "A Cappella Album"
    fill_in "Deadline", with: "01012025"
    select "Closed", from: "project_status"
    find("summary").click
    fill_in "Slug", with: "atrionix"
    click_on "Create Project"

    assert_text "Atrionix"
    click_on "Atrionix"
    find(EDIT_BTN).click

    assert_field "project_name", with: "Atrionix"
    assert_field "project_description", with: "A Cappella Album"
    assert_field "project_deadline", with: "2025-01-01"
    assert_field "project_status", with: "closed"
    find("summary").click
    assert_field "project_slug", with: "atrionix"
  end

  test "artist should not be able to create project" do
    login_as(users(:mikeshardest))
    visit projects_url
    assert_no_selector NEW_BTN

    visit new_project_url
    assert_current_path(root_path)
  end

  test "admin should be able to update project" do
    login_as(users(:aca30))
    visit project_url(@project)
    find(EDIT_BTN).click

    fill_in "Name", with: "Scuffathon Vol. 1"
    fill_in "Description", with: "Scuffathon Vol. 1"
    fill_in "Deadline", with: "11252023"
    select "Active", from: "project_status"
    find("summary").click
    fill_in "Slug", with: "scuffathon-vol-1"
    click_on "Update Project"

    find(EDIT_BTN).click
    assert_field "project_name", with: "Scuffathon Vol. 1"
    assert_field "project_description", with: "Scuffathon Vol. 1"
    assert_field "project_deadline", with: "2023-11-25"
    assert_field "project_status", with: "active"
    find("summary").click
    assert_field "project_slug", with: "scuffathon-vol-1"
  end

  test "artist should not be able to update project" do
    login_as(users(:mikeshardest))
    visit project_url(@project)
    assert_no_selector EDIT_BTN

    visit edit_project_url(@project)
    assert_current_path(root_path)
  end

  test "admin should be able to destroy project" do
    login_as(users(:aca30))
    visit project_url(@project)
    find(DELETE_BTN).click

    accept_confirm
    assert_no_text @project.name
  end

  test "artist should not be able to destroy project" do
    login_as(users(:mikeshardest))
    visit project_url(@project)
    assert_no_selector DELETE_BTN
  end
end
