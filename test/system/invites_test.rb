require "application_system_test_case"

class InvitesTest < ApplicationSystemTestCase
  setup do
    @invite = invites(:ask)
  end

  NEW_INVITE_FORM = "#new_invite"
  def delete_btn(invite)
    "button[aria-label=\"Delete #{@invite.user.name}'s invite\"]"
  end

  test "anyone should be be able to view invites" do
    login_as_any do
      visit root_path
      find('a[href="/invites"]').click
      assert_selector "h1", text: "Invites"
      assert_selector "span", text: @invite.user.name
    end
  end

  test "admin should be able to create invite" do
    login_as(users(:aca30))
    visit invites_url
    assert_selector NEW_INVITE_FORM
  end

  test "artist should not be able to create invite" do
    login_as(users(:mikeshardest))
    visit invites_url
    assert_no_selector NEW_INVITE_FORM
  end

  test "admin should be able to destroy invite" do
    login_as(users(:aca30))
    visit invites_url
    find(delete_btn(@invite)).click
    accept_confirm
    assert_no_selector "span", text: @invite.user.name
  end

  test "artist should not be able to destroy invite" do
    login_as(users(:mikeshardest))
    visit invites_url
    assert_no_selector delete_btn(@invite)
  end
end
