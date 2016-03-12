defmodule Bitpet.Simulation do
  use GenServer

  alias Bitpet.Pet, as: Pet
  alias Bitpet.House, as: House

  @tick_time_in_ms 1000

  # API
  def start_link do
    GenServer.start_link(__MODULE__, nil)
  end

  # Backend
  def init(nil) do
    pet_names = ["Petzor", "Foob", "Test Pet #3", "Wallace"]

    # Start our five pets and put them in their houses
    #
    # We want each house to have an ID so we can associate it
    # with a client channel.
    houses = pet_names
    |> Enum.map(fn name -> Pet.new(name) end)
    |> Enum.map(fn pet -> House.start_link(pet) end)
    |> Enum.map(fn {:ok, pid} -> pid end)
    |> Enum.with_index
    |> Enum.map(fn {element, index} -> {index, element} end)
    |> Enum.into(%{})

    # We want to trigger our houses periodically so we need a timer!
    #
    # We're also using `send_after` instead of `send_interval` to avoid having
    # tick messages pile up in the queue. We know that each tick message will
    # happen at *least* `@tick_time_in_mis` after the last.
    #
    # Later on we'll probably want to see if we can do some sort of catchup where
    # we rapidly simulate each tick if we've fallen behind but for now this
    # is sufficient.
    timer = :erlang.send_after(@tick_time_in_ms, self(), :tick)

    state = %{
      houses: houses,
      timer: timer
    }

    {:ok, state}
  end

  def handle_info(:tick, state) do
    :erlang.cancel_timer(state.timer)

    state = process_tick(state)

    timer = :erlang.send_after(@tick_time_in_ms, self(), :tick)
    {:noreply, %{state | timer: timer}}
  end

  defp process_tick(state) do
    # tick all of our houses.
    Enum.each(state.houses, fn {id, house} -> House.tick(house) end)

    # broadcast all of our house states to their equivalent channel.
    Enum.each(state.houses, fn {id, house} ->
      pet = House.get_pet(house)

      payload = %{
        "name": pet.name,
        "happiness": pet.happiness
      }

      Bitpet.Endpoint.broadcast!("pets:#{id}", "sync_pet", payload)
    end)

    state
  end
end
