require "application_system_test_case"

class UsersTest < ApplicationSystemTestCase
  setup do
    @user = users(:ask)
  end

  NEW_BTN = 'a[aria-label="New User"]'
  EDIT_BTN = 'a[aria-label="Edit User"]'
  DELETE_BTN = 'button[aria-label="Delete User"]'

  test "anyone should be able view users" do
    login_as_any do
      visit root_url
      find('a[href="/users"]').click
      assert_selector "h1", text: "Users"
    end
  end

  test "admin should be able to create user" do
    login_as(users(:aca30))
    visit users_url
    find(NEW_BTN).click

    fill_in "Name", with: "quabey"
    select "Artist", from: "user_role"
    fill_in "Discord ID", with: "309333315738009610"
    click_on "Create User"

    assert_selector "h1", text: "quabey"
    find(EDIT_BTN).click
    assert_field "user_name", with: "quabey"
    assert_field "user_role", with: "artist"
    assert_field "user_discord_id", with: "309333315738009610"
  end

  test "artist should not be able to create user" do
    login_as(users(:mikeshardest))
    visit users_url
    assert_no_selector NEW_BTN

    visit new_user_url
    assert_current_path(root_path)
  end

  test "admin should be able to update user" do
    login_as(users(:aca30))
    visit user_url(@user)
    find(EDIT_BTN).click

    fill_in "Name", with: "quabey"
    select "Artist", from: "user_role"
    fill_in "Discord ID", with: "309333315738009610"
    click_on "Update User"

    assert_selector "h1", text: "quabey"
    find(EDIT_BTN).click
    assert_field "user_name", with: "quabey"
    assert_field "user_role", with: "artist"
    assert_field "user_discord_id", with: "309333315738009610"
  end

  test "artist should not be able to update user" do
    login_as(users(:mikeshardest))
    visit user_url(@user)
    assert_no_selector EDIT_BTN

    visit edit_user_url(@user)
    assert_current_path(root_path)
  end

  test "admin should be able to destroy user" do
    login_as(users(:aca30))
    visit user_url(@user)
    find(DELETE_BTN).click
    accept_confirm

    visit users_url
    assert_no_selector "span", text: @user.name
  end

  test "artist should not be able to destroy user" do
    login_as(users(:mikeshardest))
    visit user_url(@user)
    assert_no_selector DELETE_BTN
  end
end
