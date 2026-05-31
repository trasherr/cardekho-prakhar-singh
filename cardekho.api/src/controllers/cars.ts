import { Context } from 'hono'
import { Car } from '../models/Car'
import { getCarRecommendations } from '../utils/llm'
import { HTTP_STATUS, ERROR_MESSAGES, CAR_CRITERIA } from '../constants'

export async function getRandomCars(c: Context) {
  try {
    const cars = await Car.aggregate([
      { $sample: { size: CAR_CRITERIA.RANDOM_SAMPLE_SIZE } }
    ])
    return c.json(cars, HTTP_STATUS.OK)
  } catch (err) {
    console.error(err)
    return c.json({ error: ERROR_MESSAGES.FETCH_CARS_FAILED }, HTTP_STATUS.INTERNAL_SERVER_ERROR)
  }
}

export async function getFormMetadata(c: Context) {
  try {
    const fuelTypes = await Car.distinct('fuel_type');
    const transmissionTypes = await Car.distinct('transmission_type');
    
    return c.json({ 
      fuelTypes: fuelTypes.filter(Boolean), 
      transmissionTypes: transmissionTypes.filter(Boolean) 
    }, HTTP_STATUS.OK);
  } catch (err) {
    console.error(err);
    return c.json({ error: ERROR_MESSAGES.FETCH_METADATA_FAILED }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function filterCars(c: Context) {
  try {
    const body = await c.req.json();
    const { budget, purpose, fuel, transmission, experience } = body;
    
    const query: any = {};

    if (budget) {
      query.selling_price = { $lte: Number(budget) };
    }
    
    if (fuel) {
      query.fuel_type = fuel;
    }
    
    if (transmission) {
      query.transmission_type = transmission;
    }
    
    // Purpose logic
    if (purpose === 'city') {
      query.mileage = { $gte: CAR_CRITERIA.CITY_MIN_MILEAGE };
    } else if (purpose === 'family') {
      query.seats = { $gte: CAR_CRITERIA.FAMILY_MIN_SEATS };
    } else if (purpose === 'thrill') {
      query.max_power = { $gte: CAR_CRITERIA.THRILL_MIN_POWER };
    } else if (purpose === 'highway') {
      query.engine = { $gte: CAR_CRITERIA.HIGHWAY_MIN_ENGINE };
    }

    // Experience logic (low maintenance for beginners)
    if (experience === 'beginner') {
      query.vehicle_age = { $lte: CAR_CRITERIA.BEGINNER_MAX_AGE };
      query.km_driven = { $lte: CAR_CRITERIA.BEGINNER_MAX_KM };
    } else if (experience === 'intermediate') {
      query.vehicle_age = { $lte: CAR_CRITERIA.INTERMEDIATE_MAX_AGE };
      query.km_driven = { $lte: CAR_CRITERIA.INTERMEDIATE_MAX_KM };
    }

    // Get up to 20 random cars matching the criteria
    const cars = await Car.aggregate([
      { $match: query },
      { $sample: { size: CAR_CRITERIA.FILTER_SAMPLE_SIZE } }
    ]);

    if (cars.length === 0) {
      return c.json([], HTTP_STATUS.OK);
    }

    const recommendations = await getCarRecommendations(
      budget,
      purpose,
      fuel,
      transmission,
      experience,
      cars
    );

    const topCars = recommendations.map((rec: any) => {
      const originalCar = cars.find(c => c._id.toString() === rec.id);
      if (originalCar) {
        return {
          ...originalCar,
          llm_reasoning: rec.reasoning
        };
      }
      return null;
    }).filter(Boolean);

    return c.json(topCars, HTTP_STATUS.OK);
  } catch (err) {
    console.error(err);
    return c.json({ error: ERROR_MESSAGES.FILTER_CARS_FAILED }, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
