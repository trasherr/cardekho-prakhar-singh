import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export async function getCarRecommendations(
  budget: string | undefined,
  purpose: string | undefined,
  fuel: string | undefined,
  transmission: string | undefined,
  experience: string | undefined,
  carsData: any[]
) {
  const parser = StructuredOutputParser.fromZodSchema(
    z.object({
      recommendations: z.array(
        z.object({
          id: z.string().describe("The exact id of the car from the provided data"),
          reasoning: z.string().describe("Explanation of why this car fits the user's requirements")
        })
      ).min(1).max(3).describe("Top 3 recommended cars based on user requirements")
    })
  );

  const formatInstructions = parser.getFormatInstructions();

  const prompt = new PromptTemplate({
    template: `You are an expert car recommendation assistant.
The user is looking for a car with the following preferences:
Budget: {budget}
Purpose: {purpose}
Fuel: {fuel}
Transmission: {transmission}
Experience Level: {experience}

Here are some available cars that match the basic criteria (in JSON format):
{cars_data}

Based on the user's requirements, select the top 3 best cars from the provided list.
Provide your reasoning for why each car is a great fit for this specific user.

{format_instructions}
`,
    inputVariables: ["budget", "purpose", "fuel", "transmission", "experience", "cars_data"],
    partialVariables: { format_instructions: formatInstructions },
  });

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY, // Ensure this matches the secret name in .env.local
  });

  const chain = prompt.pipe(model).pipe(parser);

  const response = await chain.invoke({
    budget: budget || "Any",
    purpose: purpose || "Any",
    fuel: fuel || "Any",
    transmission: transmission || "Any",
    experience: experience || "Any",
    cars_data: JSON.stringify(carsData.map(c => ({
      id: c._id.toString(),
      car_name: c.car_name,
      selling_price: c.selling_price,
      km_driven: c.km_driven,
      fuel_type: c.fuel_type,
      transmission_type: c.transmission_type,
      mileage: c.mileage,
      engine: c.engine,
      max_power: c.max_power,
      seats: c.seats,
      vehicle_age: c.vehicle_age,
    }))),
  });

  return response.recommendations;
}
