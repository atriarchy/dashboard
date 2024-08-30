require "test_helper"

class InvitesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @invite = invites(:ask)
  end

  test "should get index" do
    login_as(users(:aca30))
    get invites_url
    assert_response :success

    login_as(users(:mikeshardest))
    get invites_url
    assert_response :success
  end

  test "should create invite" do
    login_as(users(:aca30))
    assert_difference("Invite.count") do
      post invites_url, params: {
        invite: {
          role: "admin",
          discord: {
            username: "matt",
            id: "357918459058978816"
          }
        }
      }
    end

    assert_redirected_to invites_url
  end

  test "should not create invite" do
    login_as(users(:mikeshardest))
    assert_no_difference("Invite.count") do
      post invites_url, params: {
        invite: {
          role: "admin",
          discord: {
            username: "matt",
            id: "357918459058978816"
          }
        }
      }
    end
  end

  test "should destroy invite" do
    login_as(users(:aca30))
    assert_difference("Invite.count", -1) do
      delete invite_url(@invite)
    end

    assert_redirected_to invites_url
  end

  test "should not destroy invite" do
    login_as(users(:mikeshardest))
    assert_no_difference("Invite.count") do
      delete invite_url(@invite)
    end
  end
end
