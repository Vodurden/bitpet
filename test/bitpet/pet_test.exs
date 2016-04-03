defmodule Bitpet.PetTest do
  use ExUnit.Case, async: true

  test "New pets have correct name" do
    pet = Bitpet.Pet.new("TestPet")

    assert pet.name == "TestPet"
  end

  test "New pets start with 50 happiness" do
    pet = Bitpet.Pet.new("TestPet")

    assert pet.happiness == 50
  end
end
