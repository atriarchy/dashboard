# README

This README would normally document whatever steps are necessary to get the
application up and running.

# Requirements

- Ruby >= 3.3.0
- SQLite3
- Ruby Vips

# Setup

This is the development setup process. For production use the Dockerfile.

```sh
git clone https://github.com/dylhack/trackboard.git
bundle
bin/rails db:setup
# Create an admin account
ruby scripts/addadmin.rb
bin/dev
```

