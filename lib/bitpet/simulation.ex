defmodule Bitpet.Simulation do
  use GenServer

  alias Bitpet.Pet, as: Pet
  alias Bitpet.House, as: House

  @tick_time_in_ms 30 * 1000 # Every 30 seconds.

  # API
  def start_link do
    GenServer.start_link(__MODULE__, nil, name: :pet_simulation)
  end

  def get_house(id) do
    GenServer.call(:pet_simulation, {:get_house, id})
  end

  def sync_pet(id) do
    GenServer.cast(:pet_simulation, {:sync_pet, id})
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

  def handle_call({:get_house, pet_id}, _from, state) do
    {_, house} = Enum.find(state.houses, fn {id, _} -> id == pet_id end)

    {:reply, house, state}
  end

  def handle_cast({:sync_pet, pet_id}, state) do
    house_state = Enum.find(state.houses, fn {id, _} -> id == pet_id end)

    synchronize_house(house_state)

    {:noreply, state}
  end

  def handle_info(:tick, state) do
    :erlang.cancel_timer(state.timer)

    state = process_tick(state)

    timer = :erlang.send_after(@tick_time_in_ms, self(), :tick)
    {:noreply, %{state | timer: timer}}
  end

  defp process_tick(state) do
    # tick all of our houses.
    Enum.each(state.houses, fn {_, house} -> House.tick(house) end)

    synchronize_houses(state)

    state
  end

  defp synchronize_houses(state) do
    # broadcast all of our house states to their equivalent channel.
    Enum.each(state.houses, &synchronize_house/1)
  end

  defp synchronize_house({id, house}) do
    pet = House.get_pet(house)

    payload = %{
      "name": pet.name,
      "happiness": pet.happiness
    }

    Bitpet.Endpoint.broadcast!("pets:#{id}", "sync_pet", payload)
  end
end
