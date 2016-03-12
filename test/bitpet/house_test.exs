defmodule Bitpet.HouseTest do
  use ExUnit.Case, async: true

  alias Bitpet.House, as: House

  test "Pets lose 1 happiness per tick" do
    {:ok, house} = Bitpet.House.start_link(
      Bitpet.Pet.new("TestPet"))

    assert House.get_pet(house).happiness == 100

    House.tick(house)

    assert House.get_pet(house).happiness == 99
  end
end
