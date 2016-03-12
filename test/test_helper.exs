ExUnit.start

Mix.Task.run "ecto.create", ~w(-r Bitpet.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r Bitpet.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(Bitpet.Repo)

