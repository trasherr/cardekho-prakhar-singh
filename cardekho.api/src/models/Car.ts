import mongoose, { Schema, Document } from 'mongoose';

export interface ICar {
  car_name: string;
  brand: string;
  model: string;
  vehicle_age: number;
  km_driven: number;
  seller_type: string;
  fuel_type: string;
  transmission_type: string;
  mileage: number;
  engine: number;
  max_power: number;
  seats: number;
  selling_price: number;
}

const CarSchema: Schema = new Schema({
  car_name: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  vehicle_age: { type: Number, required: true },
  km_driven: { type: Number, required: true },
  seller_type: { type: String, required: true },
  fuel_type: { type: String, required: true },
  transmission_type: { type: String, required: true },
  mileage: { type: Number, required: true },
  engine: { type: Number, required: true },
  max_power: { type: Number, required: true },
  seats: { type: Number, required: true },
  selling_price: { type: Number, required: true }
});

export const Car = mongoose.model<ICar>('Car', CarSchema);
