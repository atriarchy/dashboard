require "test_helper"

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @project = projects(:dwta)
  end

  test "should get index" do
    login_as(users(:aca30))
    get projects_url
    assert_response :success

    login_as(users(:mikeshardest))
    get projects_url
    assert_response :success
  end

  test "admin should get new form" do
    login_as(users(:aca30))
    get new_project_url
    assert_response :success
  end

  test "artist should not get new form" do
    login_as(users(:mikeshardest))
    get new_project_url
    assert_response :redirect
  end

  test "admin should be able to create project" do
    login_as(users(:aca30))
    assert_difference("Project.count") do
      post projects_url, params: {
        project: {
          name: @project.name,
          description: @project.description,
          deadline: @project.deadline,
          slug: @project.slug + "2",
          status: @project.status
        }
      }
    end

    assert_redirected_to project_url(Project.last)
  end

  test "artist should not be able to create project" do
    login_as(users(:mikeshardest))
    assert_no_difference("Project.count") do
      post projects_url, params: {
        project: {
          name: @project.name,
          description: @project.description,
          deadline: @project.deadline,
          slug: @project.slug + "2",
          status: @project.status
        }
      }
    end

    assert_response :redirect
  end

  test "should show project" do
    login_as(users(:aca30))
    get project_url(@project)
    assert_response :success
  end

  test "admin should be able to get edit" do
    login_as(users(:aca30))
    get edit_project_url(@project)
    assert_response :success
  end

  test "should not get edit" do
    get edit_project_url(@project)
    assert_response :redirect
  end

  test "admin should be able to update project" do
    login_as(users(:aca30))
    patch project_url(@project), params: {
      project: {
        deadline: "2021-07-01",
        description: "My new description",
        name: "Qwerty Album",
        slug: "qwerty",
        status: "released"
      }
    }

    assert_redirected_to project_url(@project)
    project = Project.find(@project.id)
    assert_equal(project.deadline, "2021-07-01")
    assert_equal(project.description, "My new description")
    assert_equal(project.name, "Qwerty Album")
    assert_equal(project.slug, "qwerty")
    assert_equal(project.status, "released")
  end

  test "artist should not be able to update project" do
    login_as(users(:mikeshardest))
    patch project_url(@project), params: {
      project: {
        deadline: "2021-07-01",
        description: "My new description",
        name: "Qwerty Album",
        slug: "qwerty",
        status: "released"
      }
    }

    assert_response :redirect
    project = Project.find(@project.id)
    assert_not_equal(project.deadline, "2021-07-01")
    assert_not_equal(project.description, "My new description")
    assert_not_equal(project.name, "Qwerty Album")
    assert_not_equal(project.slug, "qwerty")
    assert_not_equal(project.status, :released)
  end

  test "admin should be able to destroy project" do
    login_as(users(:aca30))
    assert_difference("Project.count", -1) do
      delete project_url(@project)
    end

    assert_redirected_to projects_url
  end

  test "artist should not be able to destroy project" do
    login_as(users(:mikeshardest))
    assert_no_difference("Project.count") do
      delete project_url(@project)
    end

    assert_response :redirect
  end
end
