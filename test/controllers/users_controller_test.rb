require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:ask)
  end

  test "anyone should be able to get index" do
    login_as_any do
      get users_url
      assert_response :success
    end
  end

  test "admin should be able to get new user form" do
    login_as(users(:aca30))
    get new_user_url
    assert_response :success
  end

  test "admin should be able to create user" do
    login_as(users(:aca30))
    assert_difference("User.count") do
      post users_url, params: {
        user: {
          discord_id: "309333315738009610",
          name: "quabey",
          role: "artist"
        }
      }
    end

    user = User.last
    assert_redirected_to user_url(user)
    assert_equal "quabey", user.name
    assert_equal "309333315738009610", user.discord_id
    assert_equal "artist", user.role
  end

  test "artist should not be able to create user" do
    login_as(users(:mikeshardest))
    assert_no_difference("User.count") do
      post users_url, params: {
        user: {
          discord_id: "309333315738009610",
          name: "quabey",
          role: "artist"
        }
      }
    end

    assert_redirected_to root_url
  end

  test "anyone should be able to view user" do
    login_as_any do
      get user_url(@user)
      assert_response :success
    end
  end

  test "admin should get edit form" do
    login_as(users(:aca30))
    get edit_user_url(@user)
    assert_response :success
  end

  test "artist should not get edit form" do
    login_as(users(:mikeshardest))
    get edit_user_url(@user)
    assert_redirected_to root_url
  end

  test "admin should be able to update user" do
    login_as(users(:aca30))
    patch user_url(@user), params: {
      user: {
        discord_id: "309333315738009610",
        name: "quabey",
        role: "artist"
      }
    }

    assert_redirected_to user_url(@user)
  end

  test "artist should not be able to update user" do
    login_as(users(:mikeshardest))
    patch user_url(@user), params: {
      user: {
        discord_id: "309333315738009610",
        name: "quabey",
        role: "artist"
      }
    }

    user = User.find(@user.id)
    assert_redirected_to root_url
    assert_not_equal "quabey", user.name
    assert_not_equal "309333315738009610", user.discord_id
    assert_not_equal :artist, user.role
  end

  test "admin should be able to destroy user" do
    login_as(users(:aca30))
    assert_difference("User.count", -1) do
      delete user_url(@user)
    end

    assert_redirected_to users_url
  end

  test "artist should not be able to destroy user" do
    login_as(users(:mikeshardest))
    assert_no_difference("User.count") do
      delete user_url(@user)
    end

    assert_redirected_to root_url
  end
end
