defmodule Bitpet.Pet do
  alias Bitpet.Pet, as: Pet

  @moduledoc """
  A happy bitpet!
  """
  @type t :: %Bitpet.Pet{name: String.t, happiness: non_neg_integer}
  defstruct [:name, :happiness]

  def new(name) do
    %Pet{name: name, happiness: 100}
  end

  def update_happiness(pet, amount) do
    # Clamp between 0 and 110
    new_happiness = (pet.happiness + amount) |> max(0) |> min(110)

    %{pet | happiness: new_happiness}
  end
end
