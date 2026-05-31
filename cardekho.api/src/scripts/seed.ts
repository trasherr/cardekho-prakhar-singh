import fs from 'fs';
import path from 'path';
import { Car } from '../models/Car.ts';

export const seed = async () => {
  const datasetPath = path.join(process.cwd(), '../dataset/cardekho_dataset.csv');
  console.log(`Reading dataset from ${datasetPath}`);
  
  if (!fs.existsSync(datasetPath)) {
    console.error('Dataset file not found.');
    return;
  }
  
  const fileContent = fs.readFileSync(datasetPath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim() !== '');
  
  const carsToInsert = [];

  // Skip header, take first 100 entries
  for (let i = 1; i <= 10_000 && i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    
    const values = line.split(',');
    if (values.length < 14) continue;

    const car = {
      car_name: values[1] as string,
      brand: values[2] as string,
      model: values[3] as string,
      vehicle_age: parseInt(values[4] as string, 10),
      km_driven: parseInt(values[5] as string, 10),
      seller_type: values[6] as string,
      fuel_type: values[7] as string,
      transmission_type: values[8] as string,
      mileage: parseFloat(values[9] as string),
      engine: parseInt(values[10] as string, 10),
      max_power: parseFloat(values[11] as string),
      seats: parseInt(values[12] as string, 10),
      selling_price: parseInt(values[13] as string, 10)
    };
    carsToInsert.push(car);
  }

  try {
    const count = await Car.countDocuments();
    if (count === 0) {
      console.log('No existing cars found. Seeding dataset...');
      await Car.insertMany(carsToInsert);
      console.log(`Successfully seeded ${carsToInsert.length} cars.`);
    } else {
      console.log(`Database already has ${count} cars. Skipping seed.`);
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
