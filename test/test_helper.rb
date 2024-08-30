ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
    def login_as(user)
      if defined? visit
        visit login_url(discord_id: user.discord_id)
      else
        post session_path, params: { discord_id: user.discord_id }
      end
    end

    def login_as_any(&block)
      users = [ users(:aca30), users(:mikeshardest) ]
      users.each do |user|
        login_as(user)
        block.call
      end
    end
  end
end
