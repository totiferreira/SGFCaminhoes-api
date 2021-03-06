
'use strict'

const Driver = use('App/Models/Driver')
const Vehicle = use('App/Models/Vehicle')
const Travel = use('App/Models/Travel')
const Cart = use('App/Models/Cart')
const Itinerary = use('App/Models/Itinerary')

var moment = require('moment')


class TravelController {
 
  async index ({ request , response}) {
    var format = []
    const data = request.all()
   
    
     const travel = await Travel.query()
      .where(data)
      .with('carts')
      .with('vehicle')
      .with('driver')
      .with('itinerary')
      .fetch()

      const departureDate = await Travel.query()
      .where(data)

     
      for(let i=0; i<departureDate.length; i++){
        format[i] =  moment(new Date(departureDate[i].departureDate)).format('DD/MM/YYYY')
      }
     
      for(let i=0; i<departureDate.length; i++) {
        travel.rows[i].$attributes.departureDate = format[i]

      }
    
     return travel
    
  }
 
  async store ({ request, response }) {

    const {carts_id, ...data }  = request.only([
      'driver_id','vehicle_id', 'itinerary_id', 'carts_id', 'departureDate', 'arrivalDate', 'description', 'status'
    ])
    const travel = await Travel.create(data)
    
    const itinerary = await Itinerary.find(data.itinerary_id)

      if(carts_id && carts_id.length > 0) {
      
        if(data.status == 'finished'){
          await Cart
          .query()
          .whereIn('id', carts_id)
          .increment('km_current', itinerary.distance)
        }

        await travel.carts().attach(carts_id)
      }

      if(data.vehicle_id > 0 ) {
        if(data.status == 'finished'){
        await Vehicle
        .query()
        .where('id', data.vehicle_id)
        .increment('km_current', itinerary.distance)

        }
      }
     
    return travel
  }

  async show ({ params }) {
    
    const travel = await Travel.query()
      .where('uuid', params.id)
      .with('carts')
      .with('vehicle')
      .with('driver')
      .with('itinerary')
      .firstOrFail()
   
    return travel
  
  }


  async update ({ params, request, response }) {
    const travel = await Travel.query().where('uuid', params.id).firstOrFail()

    const {carts_id, ...data }  = request.only([
      'driver_id','vehicle_id', 'itinerary_id', 'carts_id', 'departureDate', 'arrivalDate', 'description', 'status'
    ])

    const itinerary = await Itinerary.find(data.itinerary_id)

    if(carts_id && carts_id.length > 0) {
    
      if(data.status == 'finished'){
        await Cart
        .query()
        .whereIn('id', carts_id)
        .increment('km_current', itinerary.distance)
      }
     
      await travel.carts().attach(carts_id)
    }

    if(data.vehicle_id > 0 ) {

      if(data.status == 'finished'){
      await Vehicle
      .query()
      .where('id', data.vehicle_id)
      .increment('km_current', itinerary.distance)
      }
    }

    await travel.merge(data)

    travel.save()

    return travel
  }
  
}

module.exports = TravelController
