'use strict'

const Itinerary = use('App/Models/Itinerary')

class ItineraryController {
 
  async index ({request}) {
    const data = request.all()
    
    const itineraries = Itinerary.query().where(data)

    return itineraries
  }

  
  async store ({ request }) {

    const data = request.only([
      'route_name', 'initial_point','lat_initial', 'lng_initial', 'end_point', 'lat_end', 'lng_end' , 'distance', 'observation', 'status'
    ])

    const itinerary = await Itinerary.create(data)

    return itinerary
  }

  
  async show ({ params }) {

    const itinerary = await Itinerary.query().where('uuid', params.id)

    return itinerary
  }

 
  async update ({ params, request, response }) {
    const itinerary = await Itinerary.query().where('uuid', params.id).firstOrFail()
      
    const data = request.all()
  
    itinerary.merge(data)

    await itinerary.save()

    return itinerary
  }


  async destroy ({ params, request, response }) {
  }
}

module.exports = ItineraryController
